import React from 'react';

interface StatCardProps {
    label: string;
    value: number | string;
    color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 ${color} w-full`}>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
    </div>
);