import React from 'react';

interface NotificationProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
    if (!message) return null;

    const baseClasses = "fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white transition-opacity duration-300 flex items-center z-50";
    const typeClasses = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type] || 'bg-gray-700'}`}>
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 text-xl font-bold">&times;</button>
        </div>
    );
};