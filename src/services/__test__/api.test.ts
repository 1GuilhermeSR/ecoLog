import '@testing-library/jest-dom';

jest.mock('axios', () => {

    const instance: any = jest.fn((config: any) => instance.__doRequest(config));
    instance.__doRequest = jest.fn();
    instance.__onRequest = null;
    instance.__onResponseSuccess = null;
    instance.__onResponseError = null;

    instance.interceptors = {
        request: {
            use: jest.fn((fn: any) => {
                instance.__onRequest = fn;
            }),
        },
        response: {
            use: jest.fn((onFulfilled: any, onRejected: any) => {
                instance.__onResponseSuccess = onFulfilled;
                instance.__onResponseError = onRejected;
            }),
        },
    };

    const mockAxios: any = {
        create: jest.fn(() => instance),
        post: jest.fn(), 
        __instance: instance, 
    };

    return mockAxios;
});

type LoadResult = {
    axios: any;
    api: any;
    tokenManager: any;
};

async function loadApi(): Promise<LoadResult> {
    jest.resetModules();
    process.env.REACT_APP_API_URL = 'https://api.test';

    const axios = (await import('axios')).default as any;
    const mod = await import('../api'); 
    const api = mod.default;
    const tokenManager = mod.tokenManager;
    return { axios, api, tokenManager };
}

describe('services/api (axios config e interceptors)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        sessionStorage.clear();
    });

    it('request interceptor adiciona Authorization quando há token', async () => {
        const { axios, tokenManager } = await loadApi();
        tokenManager.setToken('abc123');

        const reqHandler = axios.__instance.__onRequest!;
        const cfg = await reqHandler({ headers: {} });
        expect(cfg.headers.Authorization).toBe('Bearer abc123');
    });

    it('request interceptor não adiciona Authorization quando não há token', async () => {
        const { axios, tokenManager } = await loadApi();
        tokenManager.clearToken();

        const reqHandler = axios.__instance.__onRequest!;
        const cfg = await reqHandler({ headers: {} });
        expect(cfg.headers.Authorization).toBeUndefined();
    });

    it('401 → faz refresh com sucesso e refaz a requisição original com novo token', async () => {
        const { axios, tokenManager } = await loadApi();

        axios.post.mockResolvedValue({
            data: { data: { accessToken: 'newToken' } },
        });

        axios.__instance.__doRequest.mockResolvedValue({ ok: true });

        const err = {
            response: { status: 401 },
            config: { _retry: false, headers: {}, url: '/qualquer' },
        };

        const res = await axios.__instance.__onResponseError(err);
        expect(res).toEqual({ ok: true });

        expect(axios.post).toHaveBeenCalledWith(
            'https://api.test/user/refresh',
            {},
            { withCredentials: true }
        );

        expect(tokenManager.getToken()).toBe('newToken');

        expect(axios.__instance.__doRequest).toHaveBeenCalledTimes(1);
        const cfgChamada = axios.__instance.__doRequest.mock.calls[0][0];
        expect(cfgChamada.headers.Authorization).toBe('Bearer newToken');
    });

    it('401 concorrentes → apenas um refresh; todas reexecutadas depois', async () => {
        const { axios } = await loadApi();

        let resolveRefresh: any;
        const refreshPromise = new Promise(res => (resolveRefresh = res));
        axios.post.mockImplementation(() => refreshPromise);
        axios.__instance.__doRequest.mockResolvedValue({ ok: true });

        const makeErr = () => ({
            response: { status: 401 },
            config: { _retry: false, headers: {}, url: '/x' },
        });

        const p1 = axios.__instance.__onResponseError(makeErr());
        const p2 = axios.__instance.__onResponseError(makeErr());

        expect(axios.post).toHaveBeenCalledTimes(1);

        resolveRefresh({ data: { data: { accessToken: 'T_K' } } });

        await expect(p1).resolves.toEqual({ ok: true });
        await expect(p2).resolves.toEqual({ ok: true });

        expect(axios.__instance.__doRequest).toHaveBeenCalledTimes(2);
        const headersChamadas = axios.__instance.__doRequest.mock.calls.map(
            (c: any[]) => c[0].headers.Authorization
        );
        expect(headersChamadas.every((h: string) => h === 'Bearer T_K')).toBe(true);
    });

    it('refresh falha → limpa token/sessão e redireciona para /login', async () => {
        const { axios, tokenManager } = await loadApi();

        tokenManager.setToken('old');
        sessionStorage.setItem('usuario', 'x');

        let assignedHref = '';
        // @ts-expect-error: redefinindo location para teste
        delete window.location;
        // @ts-expect-error
        window.location = {
            set href(v: string) {
                assignedHref = v;
            },
            get href() {
                return assignedHref;
            },
        };

        axios.post.mockRejectedValue(new Error('refresh fail'));

        const err = {
            response: { status: 401 },
            config: { _retry: false, headers: {}, url: '/y' },
        };

        await expect(axios.__instance.__onResponseError(err)).rejects.toBeTruthy();

        expect(tokenManager.hasToken()).toBe(false);
        expect(sessionStorage.getItem('usuario')).toBeNull();
        expect(assignedHref).toBe('/login');
    });

    it('401 no próprio /user/refresh → redireciona para /login sem tentar novo refresh', async () => {
        const { axios, tokenManager } = await loadApi();

        tokenManager.setToken('anything');
        sessionStorage.setItem('usuario', 'x');

        let assignedHref = '';
        // @ts-expect-error
        delete window.location;
        // @ts-expect-error
        window.location = {
            set href(v: string) {
                assignedHref = v;
            },
            get href() {
                return assignedHref;
            },
        };

        const err = {
            response: { status: 401 },
            config: { _retry: false, headers: {}, url: '/user/refresh' },
        };

        await expect(axios.__instance.__onResponseError(err)).rejects.toBeTruthy();

        expect(tokenManager.hasToken()).toBe(false);
        expect(sessionStorage.getItem('usuario')).toBeNull();
        expect(assignedHref).toBe('/login');
        expect(axios.post).not.toHaveBeenCalled();
    });

    it('erros não-401 são propagados', async () => {
        const { axios } = await loadApi();
        const err = { response: { status: 500 }, config: {} };
        await expect(axios.__instance.__onResponseError(err)).rejects.toBe(err);
    });
});
