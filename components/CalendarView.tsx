import React, { useState, useMemo } from 'react';
import type { LeaveRequest, User } from '../types';
import { ChevronLeft, ChevronRight } from './Icons';
import { Button } from './common/Button';

interface CalendarViewProps {
  requests: LeaveRequest[];
  currentUser: User;
  allUsers: User[];
}

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};


export const CalendarView: React.FC<CalendarViewProps> = ({ requests, currentUser, allUsers }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const teamMembersIds = useMemo(() => {
        if (currentUser.role === 'Manager' || currentUser.role === 'HR') {
            return allUsers.filter(u => u.managerId === currentUser.id).map(u => u.id);
        }
        return [];
    }, [currentUser, allUsers]);

    const relevantRequestUserIds = [currentUser.id, ...teamMembersIds];

    const approvedRequests = useMemo(() => {
        return requests.filter(r => 
            r.status === 'Approved' && 
            (relevantRequestUserIds.includes(r.requester.id) || currentUser.role === 'HR')
        );
    }, [requests, relevantRequestUserIds, currentUser.role]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };
    
    const getEventsForDay = (day: Date) => {
        return approvedRequests.filter(req => {
            const start = req.startDate;
            const end = req.endDate;
            return day >= start && day <= end;
        });
    };

    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 = Sunday

    const calendarDays = [];
    // Previous month's padding
    for (let i = 0; i < startingDay; i++) {
        calendarDays.push(null);
    }
    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(new Date(year, month, i));
    }

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                    {currentDate.toLocaleString('default', { month: 'long' })} {year}
                </h2>
                <div className="flex space-x-2">
                    <Button variant="secondary" size="sm" onClick={handlePrevMonth} aria-label="Previous month">
                       <ChevronLeft className="w-5 h-5"/>
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleNextMonth} aria-label="Next month">
                       <ChevronRight className="w-5 h-5"/>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 grid-rows-5 gap-px border-t border-l border-gray-200 dark:border-gray-700">
                {calendarDays.map((day, index) => (
                    <div
                        key={index}
                        className={`relative min-h-[120px] bg-white dark:bg-gray-800 border-b border-r border-gray-200 dark:border-gray-700 p-2 ${!day ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}
                    >
                        {day && (
                            <>
                                <span className={`text-sm font-medium ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-gray-900 dark:text-gray-100'}`}>
                                    {day.getDate()}
                                </span>
                                <div className="mt-1 space-y-1">
                                    {getEventsForDay(day).map(event => (
                                        <div key={event.id} className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs rounded-md px-2 py-1 truncate" title={`${event.requester.name}: ${event.reason}`}>
                                            {event.requester.name.split(' ')[0]}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};