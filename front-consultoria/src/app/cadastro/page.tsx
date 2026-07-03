'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '../../services/api';
import { UserIcon, MailIcon, LockIcon } from '../../components/Icons';
import { Spinner } from '../../components/Spinner';
import { UserType } from '../../types';
import Link from 'next/link';

export default function CadastroPage() {
    const [nome, setNome] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [senha, setSenha] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();

    const handleCadastro = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await apiService.register(nome, email, senha);
            // Idealmente, mostrar uma notificação de sucesso aqui
            router.push('/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-2xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-cyan-400">Criar Conta</h2>
                <form className="space-y-6" onSubmit={handleCadastro}>
                    <div className="relative">
                        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome Completo"
                            className="w-full p-4 pl-12 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                    <div className="relative">
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
                            className="w-full p-4 pl-12 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
                        <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                    <div className="relative">
                        <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Senha (mín. 6 caracteres)"
                            className="w-full p-4 pl-12 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
                        <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                    {error && <p className="text-red-400 text-center">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full py-3 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition duration-300 flex items-center justify-center">
                        {isLoading ? <Spinner /> : 'Cadastrar'}
                    </button>
                </form>
                <p className="text-center">
                    Já tem uma conta?{' '}
                    <Link href="/login" className="font-medium text-cyan-400 hover:underline">
                        Faça Login
                    </Link>
                </p>
            </div>
        </div>
    );
}