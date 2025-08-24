import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import userService from '../services/usuario/usuarioService';

interface User {
    id: number;
    nome: string;
    email: string;
    dataNascimento: string;
    estadoId: number;
    estadoNome?: string;
}

interface AuthContextData {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    syncAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const storedUser = userService.getCurrentUser();

            if (storedUser && userService.isAuthenticated()) {
                const isValid = await userService.validateToken();
                if (isValid) {
                    setUser(storedUser);
                } else {
                    const refreshed = await userService.refreshToken();
                    if (refreshed) setUser(storedUser);
                    else {
                        await userService.logout();
                        setUser(null);
                    }
                }
            } else if (storedUser) {
                const refreshed = await userService.refreshToken();
                if (refreshed) setUser(storedUser);
                else {
                    await userService.logout();
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const syncAuth = async () => {
        setLoading(true);
        try {
            await checkAuth();
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isAuthenticated: !!user,
            syncAuth,
        }}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }

    return context;
};