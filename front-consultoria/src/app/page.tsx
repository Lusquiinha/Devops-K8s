'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from '../components/Spinner';

export default function HomePage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (user) {
                router.replace('/dashboard');
            } else {
                router.replace('/login');
            }
        }
    }, [user, isLoading, router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Spinner />
        </div>
    );
}