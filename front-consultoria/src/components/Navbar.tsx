'use client';

import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
    const { user, logout } = useAuth();
    
    if (!user) return null;

    return (
        <nav className="bg-gray-800 p-4 shadow-lg flex justify-between items-center">
            <Link href="/dashboard" className="text-xl font-bold text-cyan-400 cursor-pointer">
                Plataforma de Consultoria
            </Link>
            <div className="flex items-center space-x-4">
                <span className="text-gray-300 hidden sm:block">Olá, {user.name || user.email}</span>
                <Link href="/dashboard" className="font-medium text-white hover:text-cyan-400 transition">Painel</Link>
                <Link href="/historico" className="font-medium text-white hover:text-cyan-400 transition">Histórico</Link>
                <button onClick={logout} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition">Sair</button>
            </div>
        </nav>
    );
}