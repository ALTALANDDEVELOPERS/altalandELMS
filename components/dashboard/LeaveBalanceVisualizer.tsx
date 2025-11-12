import React from 'react';
import type { User } from '../../types';
import { DEFAULT_LEAVE_ALLOWANCES } from '../../constants';

interface LeaveBalanceVisualizerProps {
    leaveBalances: User['leaveBalances'];
}

const BalanceBar: React.FC<{
    label: string;
    remaining: number;
    total: number;
}> = ({ label, remaining, total }) => {
    const percentage = total > 0 ? (remaining / total) * 100 : 0;
    const progressColor = percentage > 50 ? 'bg-blue-500' : percentage > 25 ? 'bg-yellow-500' : 'bg-red-500';

    return (
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-bold">{remaining}</span> / {total} days
                </span>
            </div>
            <div className={`w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700`}>
                <div className={`${progressColor} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};


export const LeaveBalanceVisualizer: React.FC<LeaveBalanceVisualizerProps> = ({ leaveBalances }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Your Leave Balances</h3>
            <div className="space-y-4">
                <BalanceBar
                    label="Vacation"
                    remaining={leaveBalances.vacation}
                    total={DEFAULT_LEAVE_ALLOWANCES.vacation}
                />
                <BalanceBar
                    label="Sick Days"
                    remaining={leaveBalances.sick}
                    total={DEFAULT_LEAVE_ALLOWANCES.sick}
                />
                <BalanceBar
                    label="Personal Days"
                    remaining={leaveBalances.personal}
                    total={DEFAULT_LEAVE_ALLOWANCES.personal}
                />
            </div>
        </div>
    );
};