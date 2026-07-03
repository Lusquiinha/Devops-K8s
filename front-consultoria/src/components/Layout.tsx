import React, { ReactNode, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Notification } from './Notification';

interface LayoutProps {
    children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, logout } = useAuth();
    const router = useRouter();
    
    const handleNavigate = (path: string) => {
        router.push(path);
    };

    return (
        <div className="bg-gray-900 min-h-screen text-white font-sans">
            {user && (
                <nav className="bg-gray-800 p-4 shadow-lg flex justify-between items-center">
                    <h1 className="text-xl font-bold text-cyan-400 cursor-pointer" onClick={() => handleNavigate('/dashboard')}>Plataforma de Consultoria</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-300 hidden sm:block">Olá, {user.name || user.email}</span>
                        <button onClick={() => handleNavigate('/dashboard')} className="font-medium text-white hover:text-cyan-400 transition">Painel</button>
                        <button onClick={() => handleNavigate('/historico')} className="font-medium text-white hover:text-cyan-400 transition">Histórico</button>
                        <button onClick={logout} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition">Sair</button>
                    </div>
                </nav>
            )}
            <main>{children}</main>
        </div>
    );
};