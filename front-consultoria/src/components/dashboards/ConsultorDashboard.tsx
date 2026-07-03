import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/api';
import { socket } from '../../services/socket';
import { Question } from '../../types';
import { Spinner } from '../Spinner';

export default function ConsultorDashboard() {
    const { user } = useAuth();
    const [perguntas, setPerguntas] = useState<Question[]>([]);
    const [claimed, setClaimed] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [atendendo, setAtendendo] = useState<Question | null>(null);
    const [textoResposta, setTextoResposta] = useState<string>('');
    const [notification, setNotification] = useState<string>('');

    const fetchPendentes = useCallback(async () => {
        try {
            const [pendentes, claimedQuestions] = await Promise.all([
                apiService.getPerguntasPendentes(),
                apiService.getPerguntasReivindicadas(user?.id)
            ]);
            console.log("Perguntas pendentes:", pendentes);
            console.log("Perguntas reivindicadas:", claimedQuestions);
            setPerguntas(pendentes);
            setClaimed(claimedQuestions);
        } catch (err) {
            setNotification('Erro ao buscar perguntas');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchPendentes();

        socket.on('newQuestion', (novaPergunta: Question) => {
            apiService.getClientAndConsultant(novaPergunta)
                .then((questionWithDetails) => {
                    setPerguntas(prev => [questionWithDetails, ...prev]);
                    setNotification('Uma nova pergunta chegou!');
                });
        });

        socket.on('questionClaimed', ({ questionId, consultantName }: {questionId: string, consultantName: string}) => {
            setPerguntas(prev => prev.filter(p => p.id !== questionId));
        });

        return () => {
            socket.off('newQuestion');
            socket.off('questionClaimed');
        };
    }, [fetchPendentes]);

    const handleReivindicar = async (perguntaId: string) => {
        if (!user) return;
        try {
            const data = await apiService.reivindicarPergunta(perguntaId, user.id);
            console.log("Pergunta reivindicada:", data);
            setClaimed(prev => [data, ...prev]);
            setPerguntas(prev => prev.filter(p => p.id !== perguntaId));
            setNotification('Pergunta reivindicada!');
        } catch (err: any) {
            setNotification(err.message);
            fetchPendentes();
        }
    };

    const handleEnviarResposta = async (e: FormEvent, perguntaId: string) => {
        e.preventDefault();
        if (!textoResposta.trim() || !user) return;
        try {
            await apiService.enviarResposta(textoResposta, perguntaId, user.id);
            setNotification('Resposta enviada com sucesso!');
            setClaimed(prev => prev.filter(p => p.id !== perguntaId));
            setAtendendo(null);
            setTextoResposta('');
        } catch (err: any) {
            setNotification(err.message);
        }
    };

    return (
        <div className="p-4 md:p-8">
            {notification && <div className="p-4 mb-4 rounded-lg bg-blue-500">{notification}</div>}

            <h2 className="text-3xl font-bold text-cyan-400 mb-6">Perguntas Pendentes</h2>
            {isLoading ? <Spinner /> : perguntas.length === 0 ? (
                <p className="text-center text-gray-400 bg-gray-800 p-6 rounded-lg">Nenhuma pergunta pendente.</p>
            ) : (
                <div className="space-y-4">
                    {perguntas.map(p => (
                        <div key={p.id} className="bg-gray-800 p-6 rounded-lg shadow-md flex justify-between items-center">
                            <div>
                                <p className="text-white">{p.content}</p>
                                <p className="text-sm text-gray-400 mt-2">Enviado por: {p.client.name}</p>
                            </div>
                            <button onClick={() => handleReivindicar(p.id)}
                                className="px-6 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition">Atender</button>
                        </div>
                    ))}
                </div>
            )}

            <h2 className="text-3xl font-bold text-cyan-400 mt-10 mb-6">Perguntas Reivindicadas</h2>
            {claimed.length === 0 ? (
                <p className="text-center text-gray-400 bg-gray-800 p-6 rounded-lg">Nenhuma pergunta reivindicada.</p>
            ) : (
                <div className="space-y-4">
                    {claimed.map(p => (
                        atendendo && atendendo.id === p.id ? (
                            <div key={p.id} className="bg-gray-800 p-6 rounded-lg shadow-md">
                                <p className="text-white">{atendendo.content}</p>
                                <p className="text-sm text-gray-400 mt-2">Enviado por: {atendendo.client.name}</p>
                                <form onSubmit={(e) => handleEnviarResposta(e, atendendo.id)} className="mt-4">
                                    <textarea value={textoResposta} onChange={(e) => setTextoResposta(e.target.value)}
                                        placeholder="Digite sua resposta aqui..."
                                        className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[100px] text-white" required />
                                    <div className="flex justify-end mt-4 space-x-2">
                                        <button type="button" onClick={() => { setAtendendo(null); setTextoResposta(''); }}
                                            className="px-6 py-2 font-semibold text-white bg-gray-500 rounded-lg hover:bg-gray-600 transition">Cancelar</button>
                                        <button type="submit" className="px-6 py-2 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition">Enviar Resposta</button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div key={p.id} className="bg-gray-800 p-6 rounded-lg shadow-md flex justify-between items-center">
                                <div>
                                    <p className="text-white">{p.content}</p>
                                    <p className="text-sm text-gray-400 mt-2">Enviado por: {p.client.name}</p>
                                </div>
                                <button onClick={() => {setAtendendo(p); setTextoResposta('');}}
                                    className="px-6 py-2 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition">Responder</button>
                            </div>
                        )
                    ))}
                </div>
            )}
        </div>
    );
}