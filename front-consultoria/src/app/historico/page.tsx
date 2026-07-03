'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/api';
import { Question, UserType } from '../../types';
import { Spinner } from '../../components/Spinner';
import AuthGuard from '../../components/AuthGuard';
import { socket } from '@/services/socket';

function HistoricoContent() {
    const { user } = useAuth();
    const [historico, setHistorico] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    const fetchHistorico = useCallback(async () => {
        if (!user) return;
        setError('');
        try {
            const data = await apiService.getHistorico(user.role, user.id);
            setHistorico(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchHistorico();
    }, [fetchHistorico]);

    useEffect(() => {
        if (!user || user.role !== UserType.CLIENTE) {
            return;
        }

        // Conecta ao socket passando o ID do usuário para entrar na sala correta
        socket.io.opts.query = { userId: user.id };
        socket.connect();

        socket.on('questionAnswered', fetchHistorico);
        socket.on('questionClaimed', fetchHistorico);

        return () => {
            socket.off('questionAnswered', fetchHistorico);
            socket.off('questionClaimed', fetchHistorico);
            socket.disconnect();
        };
    }, [user, fetchHistorico]);

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('pt-BR');
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    }

    return (
        <div className="p-4 md:p-8">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6">Meu Histórico</h2>
            {error && <p className="text-red-400 text-center">{error}</p>}
            {historico.length === 0 && !isLoading ? (
                <p className="text-center text-gray-400 bg-gray-800 p-6 rounded-lg">Nenhum item no histórico.</p>
            ) : (
                <div className="space-y-6">
                    {historico.map((item: Question) => (
                        <div key={item.id} className="bg-gray-800 p-6 rounded-lg shadow-md">
                            <div className="mb-4">
                               <p className="text-sm text-gray-400">Enviada em: {formatDate(item.createdAt)}</p>
                               <p className="font-bold text-white mt-2">P: {item.content}</p>
                            </div>
                            <div className="border-t border-gray-700 pt-4 space-y-2">
                               {/* Claimed section */}
                               {item.consultant && item.claimedAt && (
                                   <p className="text-sm text-blue-300">Reivindicada por {item.consultant.name} em: {formatDate(item.claimedAt)}</p>
                               )}
                               {/* Answered section */}
                               {item.answer ? (
                                   <>
                                     <p className="text-sm text-gray-400">Respondida por {item.consultant?.name} em: {formatDate(item.answer.createdAt)}</p>
                                     <p className="text-cyan-300 mt-2">R: {item.answer.content}</p>
                                   </>
                               ) : (
                                   <p className="text-yellow-400">Aguardando resposta...</p>
                               )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function HistoricoPage() {
    return (
        <AuthGuard>
            <HistoricoContent />
        </AuthGuard>
    );
}