'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from './Spinner';
import { apiService } from '@/services/api';

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace('/login');
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        apiService.setOnUnauthorized(() => {
            logout();
        });
    }, [router]);

    // Enquanto carrega ou se o usuário não existir (antes do redirecionamento), mostra um spinner.
    if (isLoading || !user) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner />
            </div>
        );
    }

    // Se o usuário existir, renderiza o conteúdo da página protegida.
    return <>{children}</>;
}
