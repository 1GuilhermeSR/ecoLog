import axios from 'axios';


// Classe para gerenciar o token em memória
class TokenManager {
    private accessToken: string | null = null;

    setToken(token: string) {
        this.accessToken = token;
    }

    getToken(): string | null {
        return this.accessToken;
    }

    clearToken() {
        this.accessToken = null;
    }

    hasToken(): boolean {
        return this.accessToken !== null;
    }
}

// Instância do gerenciador de token
export const tokenManager = new TokenManager();

// Configuração base do axios
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://localhost:5211/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Anexa o Bearer em toda request
api.interceptors.request.use((config) => {
    const token = tokenManager.getToken();
    if (token) {
        config.headers = config.headers ?? {};
        (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
});

// Flag para evitar múltiplas tentativas de refresh simultâneas
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// Adiciona callbacks para serem executados quando o token for renovado
const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

// Executa todos os callbacks pendentes com o novo token
const onTokenRefreshed = (token: string) => {
    refreshSubscribers.map(cb => cb(token));
    refreshSubscribers = [];
};

// Interceptor para tratar erros de resposta e renovar token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Se o erro for 401 e não for uma tentativa de retry
        if (error.response?.status === 401 && !originalRequest._retry) {

            // Se for a própria chamada de refresh que falhou, redireciona para login
            if (originalRequest.url?.includes('/user/refresh')) {
                tokenManager.clearToken();
                sessionStorage.removeItem('usuario');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    // Tenta renovar o token usando o refresh token no cookie
                    const response = await axios.post(
                        `${process.env.REACT_APP_API_URL || 'https://localhost:5211/api'}/user/refresh`,
                        {},
                        { withCredentials: true }
                    );

                    const { accessToken } = response.data.data;
                    tokenManager.setToken(accessToken);
                    isRefreshing = false;

                    // Executa todas as requisições que estavam aguardando
                    onTokenRefreshed(accessToken);

                    // Refaz a requisição original com o novo token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);

                } catch (refreshError) {
                    isRefreshing = false;
                    tokenManager.clearToken();
                    sessionStorage.removeItem('usuario');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }

            // Se já está renovando, aguarda a renovação
            return new Promise((resolve) => {
                subscribeTokenRefresh((token: string) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    resolve(api(originalRequest));
                });
            });
        }

        return Promise.reject(error);
    }
);

export default api;
