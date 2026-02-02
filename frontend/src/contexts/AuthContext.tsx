'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';

interface User {
    id: number;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://winn-yearly-budget.onrender.com';

    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
            verifyToken(storedToken);
        } else {
            setLoading(false);
        }
    }, []);

    const verifyToken = async (t: string) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${t}` }
            });
            setUser(response.data);
            setToken(t);
        } catch (error) {
            localStorage.removeItem('auth_token');
            setUser(null);
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const login = (newToken: string) => {
        localStorage.setItem('auth_token', newToken);
        setToken(newToken);
        verifyToken(newToken);
        router.push('/');
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        setUser(null);
        setToken(null);
        router.push('/login');
    };

    // Protected route logic
    useEffect(() => {
        const publicPages = ['/login', '/register'];
        if (!loading && !user && !publicPages.includes(pathname)) {
            router.push('/login');
        }
    }, [user, loading, pathname, router]);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
