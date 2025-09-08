
jest.mock('../../api', () => {
    const apiObj = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    };
    const tokenManager = {
        setToken: jest.fn(),
        clearToken: jest.fn(),
        hasToken: jest.fn().mockReturnValue(false),
        getToken: jest.fn(),
    };
    return { __esModule: true, default: apiObj, tokenManager };
});

import UsuarioService from '../usuarioService';
import api, { tokenManager } from '../../api';

describe('UsuarioService', () => {
    let store: Record<string, string>;

    beforeEach(() => {
        jest.clearAllMocks();
        store = {};

        const mockSessionStorage = {
            getItem: jest.fn((k: string) => (k in store ? store[k] : null)),
            setItem: jest.fn((k: string, v: string) => { store[k] = String(v); }),
            removeItem: jest.fn((k: string) => { delete store[k]; }),
            clear: jest.fn(() => { store = {}; }),
        };

        Object.defineProperty(window, 'sessionStorage', {
            value: mockSessionStorage,
            writable: true,
            configurable: true,
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('login', () => {
        it('salva token + usuario no sessionStorage ao sucesso e retorna payload', async () => {
            const credentials = { email: 'a@b.com', senha: '123' } as any;
            const payload = {
                success: true,
                data: {
                    accessToken: 'jwt123',
                    usuario: { id: 1, nome: 'Alice' },
                },
            };
            (api.post as jest.Mock).mockResolvedValueOnce({ data: payload });

            const res = await UsuarioService.login(credentials);

            expect(api.post).toHaveBeenCalledWith('/user/login', credentials);
            expect(tokenManager.setToken).toHaveBeenCalledWith('jwt123');
            expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
                'usuario',
                JSON.stringify({ id: 1, nome: 'Alice' })
            );
            expect(res).toEqual(payload);
        });

        it('propaga erro padronizado quando falhar', async () => {
            (api.post as jest.Mock).mockRejectedValueOnce(new Error('boom'));
            await expect(UsuarioService.login({} as any)).rejects.toMatchObject({
                success: false,
                message: 'Erro ao realizar login\n',
            });
        });
    });

    describe('register', () => {
        it('salva token + usuario ao sucesso e retorna payload', async () => {
            const data = { email: 'a@b.com', senha: '123', nome: 'Alice' } as any;
            const payload = {
                success: true,
                data: {
                    accessToken: 'jwtXYZ',
                    usuario: { id: 99, nome: 'Alice' },
                },
            };
            (api.post as jest.Mock).mockResolvedValueOnce({ data: payload });

            const res = await UsuarioService.register(data);

            expect(api.post).toHaveBeenCalledWith('/user/register', data);
            expect(tokenManager.setToken).toHaveBeenCalledWith('jwtXYZ');
            expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
                'usuario',
                JSON.stringify({ id: 99, nome: 'Alice' })
            );
            expect(res).toEqual(payload);
        });

        it('erro padronizado ao falhar', async () => {
            (api.post as jest.Mock).mockRejectedValueOnce(new Error('x'));
            await expect(UsuarioService.register({} as any)).rejects.toMatchObject({
                success: false,
                message: 'Erro ao realizar cadastro\n',
            });
        });
    });

    describe('editarEstado', () => {
        it('faz PUT e atualiza sessionStorage quando success=true', async () => {
            const usuario = { id: 1, estadoId: 20 } as any;
            const payload = { success: true, data: { id: 1, estadoId: 20 } };
            (api.put as jest.Mock).mockResolvedValueOnce({ data: payload });

            const res = await UsuarioService.editarEstado(usuario);

            expect(api.put).toHaveBeenCalledWith('/user/editarEstado', usuario);
            expect(window.sessionStorage.setItem).toHaveBeenCalledWith('usuario', JSON.stringify(payload.data));
            expect(res).toEqual(payload);
        });

        it('erro padronizado ao falhar', async () => {
            (api.put as jest.Mock).mockRejectedValueOnce(new Error('nope'));
            await expect(UsuarioService.editarEstado({} as any)).rejects.toMatchObject({
                success: false,
                message: 'Erro ao editar estado\n',
            });
        });
    });

    describe('excluirConta', () => {
        it('chama DELETE e aciona logout quando success=true', async () => {
            const payload = { success: true };
            (api.delete as jest.Mock).mockResolvedValueOnce({ data: payload });

            const spyLogout = jest.spyOn(UsuarioService, 'logout').mockResolvedValueOnce();

            const res = await UsuarioService.excluirConta();

            expect(api.delete).toHaveBeenCalledWith('/user/excluirUsuario');
            expect(spyLogout).toHaveBeenCalledTimes(1);
            expect(res).toEqual(payload);
        });

        it('erro padronizado ao falhar', async () => {
            (api.delete as jest.Mock).mockRejectedValueOnce(new Error('rip'));
            await expect(UsuarioService.excluirConta()).rejects.toMatchObject({
                success: false,
                message: 'Erro ao excluir conta\n',
            });
        });
    });

    describe('logout', () => {
        it('sempre limpa token e sessionStorage, mesmo se API falhar', async () => {
            (api.post as jest.Mock).mockResolvedValueOnce({ data: { success: true } });

            await UsuarioService.logout();

            expect(api.post).toHaveBeenCalledWith('/user/logout');
            expect(tokenManager.clearToken).toHaveBeenCalled();
            expect(window.sessionStorage.removeItem).toHaveBeenCalledWith('usuario');

            (api.post as jest.Mock).mockRejectedValueOnce(new Error('fail'));
            const errSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            await UsuarioService.logout();

            expect(api.post).toHaveBeenCalledWith('/user/logout');
            expect(tokenManager.clearToken).toHaveBeenCalledTimes(2);
            expect(window.sessionStorage.removeItem).toHaveBeenCalledWith('usuario');

            errSpy.mockRestore();
        });
    });

    describe('forgotPassword', () => {
        it('retorna response.data no sucesso', async () => {
            const payload = { success: true, message: 'ok' };
            (api.post as jest.Mock).mockResolvedValueOnce({ data: payload });

            const res = await UsuarioService.forgotPassword('a@b.com');

            expect(api.post).toHaveBeenCalledWith('/user/forgotPassword', { email: 'a@b.com' });
            expect(res).toEqual(payload);
        });

        it('propaga erro.response.data quando presente', async () => {
            const errPayload = { success: false, message: 'Email não encontrado' };
            (api.post as jest.Mock).mockRejectedValueOnce({ response: { data: errPayload } });

            await expect(UsuarioService.forgotPassword('x@y.com')).rejects.toEqual(errPayload);
        });

        it('propaga objeto genérico quando não há response.data', async () => {
            (api.post as jest.Mock).mockRejectedValueOnce(new Error('x'));

            await expect(UsuarioService.forgotPassword('x@y.com')).rejects.toMatchObject({
                success: false,
                message: 'Erro ao solicitar recuperação de senha',
            });
        });
    });

    describe('resetPassword', () => {
        it('retorna response.data no sucesso', async () => {
            const payload = { success: true };
            (api.post as jest.Mock).mockResolvedValueOnce({ data: payload });

            const res = await UsuarioService.resetPassword({ token: 't', newPassword: '123' } as any);

            expect(api.post).toHaveBeenCalledWith('/user/resetPassword', { token: 't', newPassword: '123' });
            expect(res).toEqual(payload);
        });

        it('erro padronizado ao falhar', async () => {
            (api.post as jest.Mock).mockRejectedValueOnce(new Error('bad'));

            await expect(
                UsuarioService.resetPassword({ token: 't', newPassword: '123' } as any)
            ).rejects.toMatchObject({
                success: false,
                message: 'Erro ao redefinir senha\n',
            });
        });
    });

    describe('validateToken', () => {
        it('retorna true quando success=true', async () => {
            (api.get as jest.Mock).mockResolvedValueOnce({ data: { success: true } });
            const ok = await UsuarioService.validateToken();
            expect(api.get).toHaveBeenCalledWith('/user/validate');
            expect(ok).toBe(true);
        });

        it('retorna false quando success=false', async () => {
            (api.get as jest.Mock).mockResolvedValueOnce({ data: { success: false } });
            const ok = await UsuarioService.validateToken();
            expect(ok).toBe(false);
        });

        it('retorna false no catch', async () => {
            (api.get as jest.Mock).mockRejectedValueOnce(new Error('x'));
            const ok = await UsuarioService.validateToken();
            expect(ok).toBe(false);
        });
    });

    describe('refreshToken', () => {
        it('seta token e retorna true quando success=true e há accessToken', async () => {
            (api.post as jest.Mock).mockResolvedValueOnce({ data: { success: true, data: { accessToken: 'newJWT' } } });
            const ok = await UsuarioService.refreshToken();
            expect(api.post).toHaveBeenCalledWith('/user/refresh', {});
            expect(tokenManager.setToken).toHaveBeenCalledWith('newJWT');
            expect(ok).toBe(true);
        });

        it('retorna false quando não houver data/accessToken', async () => {
            (api.post as jest.Mock).mockResolvedValueOnce({ data: { success: true, data: null } });
            const ok = await UsuarioService.refreshToken();
            expect(ok).toBe(false);
        });

        it('retorna false no catch', async () => {
            (api.post as jest.Mock).mockRejectedValueOnce(new Error('nope'));
            const ok = await UsuarioService.refreshToken();
            expect(ok).toBe(false);
        });
    });

    describe('isAuthenticated', () => {
        it('reflete tokenManager.hasToken', () => {
            (tokenManager.hasToken as jest.Mock).mockReturnValueOnce(false);
            expect(UsuarioService.isAuthenticated()).toBe(false);

            (tokenManager.hasToken as jest.Mock).mockReturnValueOnce(true);
            expect(UsuarioService.isAuthenticated()).toBe(true);

            (tokenManager.hasToken as jest.Mock).mockReturnValueOnce(false);
            expect(UsuarioService.isAuthenticated()).toBe(false);
        });
    });

    describe('getCurrentUser', () => {
        it('retorna objeto quando há JSON no sessionStorage', () => {
            (window.sessionStorage.setItem as jest.Mock)('usuario', JSON.stringify({ id: 7, nome: 'Bob' }));
            const u = UsuarioService.getCurrentUser();
            expect(u).toEqual({ id: 7, nome: 'Bob' });
        });

        it('retorna null quando não há item', () => {
            (window.sessionStorage.removeItem as jest.Mock)('usuario');
            const u = UsuarioService.getCurrentUser();
            expect(u).toBeNull();
        });

        it('retorna null quando o valor salvo é a string "undefined"', () => {
            (window.sessionStorage.setItem as jest.Mock)('usuario', 'undefined');
            const u = UsuarioService.getCurrentUser();
            expect(u).toBeNull();
        });
    });
});
