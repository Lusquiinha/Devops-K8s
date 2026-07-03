import React, { useState, FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/api';
import { Spinner } from '@/components/Spinner';

export default function ClienteDashboard() {
    const { user } = useAuth();
    const [textoPergunta, setTextoPergunta] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!textoPergunta.trim() || !user) return;
        
        setIsLoading(true);
        setNotification(null);
        try {
            await apiService.criarPergunta(textoPergunta, user.id);
            setNotification({ message: 'Pergunta enviada com sucesso!', type: 'success' });
            setTextoPergunta('');
        } catch (err: any) {
            setNotification({ message: err.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6">Fazer uma Pergunta</h2>
            {notification && <div className={`p-4 mb-4 rounded-lg ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>{notification.message}</div>}
            <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-md">
                <textarea
                    value={textoPergunta}
                    onChange={(e) => setTextoPergunta(e.target.value)}
                    placeholder="Digite sua dúvida aqui..."
                    className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[150px] text-white"
                    required
                />
                <div className="flex justify-end mt-4">
                    <button type="submit" disabled={isLoading} className="px-6 py-2 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition duration-300 flex items-center">
                        {isLoading ? <Spinner /> : 'Enviar Pergunta'}
                    </button>
                </div>
            </form>
        </div>
    );
}