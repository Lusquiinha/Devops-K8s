'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    setToken: (newToken: string | null) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setTokenState] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            setToken(storedToken);
        }
        setIsLoading(false);
    }, []);

    const setToken = (newToken: string | null) => {
        setTokenState(newToken);
        apiService.setToken(newToken);
        if (newToken) {
            localStorage.setItem('authToken', newToken);
            const userData = JSON.parse(atob(newToken.split('.')[1]));
            console.log('User data from token:', userData);
            setUser({ id: userData.sub, email: userData.email, role: userData.role, name: userData.name });
        } else {
            localStorage.removeItem('authToken');
            setUser(null);
        }
    };

    const logout = () => {
        setToken(null);
        
    };

    const authContextValue: AuthContextType = {
        user,
        token,
        isLoading,
        setToken,
        logout,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};