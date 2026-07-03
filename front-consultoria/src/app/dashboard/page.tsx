'use client';

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import ClienteDashboard from '../../components/dashboards/ClienteDashboard';
import ConsultorDashboard from '../../components/dashboards/ConsultorDashboard';
import { UserType } from '../../types';
import AuthGuard from '../../components/AuthGuard';

function DashboardContent() {
    const { user } = useAuth();

    if (user?.role === UserType.CLIENTE) {
        return <ClienteDashboard />;
    }

    if (user?.role === UserType.CONSULTOR) {
        return <ConsultorDashboard />;
    }

    // Fallback caso o tipo de usuário seja desconhecido.
    return <p className="text-center mt-10">Tipo de utilizador desconhecido.</p>;
}

export default function DashboardPage() {
    return (
        <AuthGuard>
            <DashboardContent />
        </AuthGuard>
    );
}