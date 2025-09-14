'use client';

import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

export type UserType = "ADMIN" | "MEMBER";

export interface User {
    id: string;
    email: string;
    role: UserType;
    tenantId: string;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
    register: (email: string, password: string, role: UserType, slug: string) => Promise<{ success: boolean; message: string }>;
    registerTenant: (name: string, slug: string) => Promise<{ success: boolean; message: string }>;
    logout: () => void;
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:8080/api';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user && !!token;

    const router = useRouter();

    useEffect(() => {
        const loadAuthState = () => {
            try {
                // Only run in browser environment
                if (typeof window === 'undefined') {
                    setIsLoading(false);
                    return;
                }

                const storedToken = localStorage.getItem('auth_token');
                const storedUser = localStorage.getItem('auth_user');
                
                if (storedToken && storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setToken(storedToken);
                    setUser(parsedUser);
                }
            } catch (error) {
                console.error('Error loading auth state:', error);
                // Clear invalid data only in browser
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('auth_user');
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadAuthState();
    }, []);

    const saveAuthState = (user: User, token: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token);
            localStorage.setItem('auth_user', JSON.stringify(user));
        }
        setUser(user);
        setToken(token);
    };

    // Clear auth state
    const clearAuthState = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
        }
        setUser(null);
        setToken(null);
    };

    const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
        try {
            setIsLoading(true);
            
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.user && data.token) {
                const userWithCorrectType: User = {
                    id: data.user.id,
                    email: data.user.email,
                    role: data.user.role,
                    tenantId: data.user.tenantId
                };
                
                saveAuthState(userWithCorrectType, data.token);
                toast.success(data.message || 'Login successful');
                if(userWithCorrectType.role === 'ADMIN') {
                    router.push('/admin');
                } else {
                    router.push('/user');
                }
                return { success: true, message: data.message || 'Login successful' };
            } else {
                toast.error(data.message || 'Login failed');
                return { success: false, message: data.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Network error. Please try again.');
            return { success: false, message: 'Network error. Please try again.' };
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (email: string, password: string, role: UserType, slug: string): Promise<{ success: boolean; message: string }> => {
        try {
            setIsLoading(true);
            
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, role, slug }),
            });

            const data = await response.json();

            if (response.ok && data.user && data.token) {
                const userWithCorrectType: User = {
                    id: data.user.id,
                    email: data.user.email,
                    role: data.user.role,
                    tenantId: data.user.tenantId
                };
                
                saveAuthState(userWithCorrectType, data.token);
                if(userWithCorrectType.role === 'ADMIN') {
                    router.push('/admin');
                } else {
                    router.push('/user');
                }
                toast.success(data.message || 'Registration successful');
                return { success: true, message: data.message || 'Registration successful' };
            } else {
                toast.error(data.message || 'Registration failed');
                return { success: false, message: data.message || 'Registration failed' };
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error('Network error. Please try again.');
            return { success: false, message: 'Network error. Please try again.' };
        } finally {
            setIsLoading(false);
        }
    };

    const registerTenant = async (name: string, slug: string): Promise<{ success: boolean; message: string }> => {
        try {
            setIsLoading(true);
            
            const response = await fetch(`${API_BASE_URL}/auth/register-tenant`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, slug }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || 'Tenant created successfully');
                return { success: true, message: data.message || 'Tenant created successfully' };
            } else {
                toast.error(data.message || 'Tenant creation failed');
                return { success: false, message: data.message || 'Tenant creation failed' };
            }
        } catch (error) {
            console.error('Tenant registration error:', error);
            toast.error('Network error. Please try again.');
            return { success: false, message: 'Network error. Please try again.' };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        clearAuthState();
        toast.success('Logged out successfully');
        router.push('/');
    };

    const refreshAuth = async (): Promise<void> => {
        // This would typically validate the current token with the backend
        // For now, we'll just check if we have a valid token in localStorage
        try {
            if (typeof window === 'undefined') return;
            
            const storedToken = localStorage.getItem('auth_token');
            if (!storedToken) {
                clearAuthState();
                return;
            }

            // You could add a token validation endpoint here
            // const response = await fetch(`${API_BASE_URL}/auth/validate`, {
            //     headers: { Authorization: `Bearer ${storedToken}` }
            // });
            // if (!response.ok) clearAuthState();
        } catch (error) {
            console.error('Auth refresh error:', error);
            clearAuthState();
        }
    };

    const value: AuthContextType = {
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        register,
        registerTenant,
        logout,
        refreshAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        // During SSR, return safe default values
        if (typeof window === 'undefined') {
            return {
                user: null,
                token: null,
                isLoading: true,
                isAuthenticated: false,
                login: async () => ({ success: false, message: 'SSR context' }),
                register: async () => ({ success: false, message: 'SSR context' }),
                registerTenant: async () => ({ success: false, message: 'SSR context' }),
                logout: () => {},
                refreshAuth: async () => {},
            };
        }
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;