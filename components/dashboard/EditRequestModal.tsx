import React, { useState, useEffect } from 'react';
import type { LeaveRequest, LeaveType } from '../../types';
import { LEAVE_TYPES } from '../../constants';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

// Helper to format date for input type="date"
const formatDateForInput = (date: Date): string => {
    // Adjust for timezone offset to prevent date from shifting
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() - timezoneOffset);
    return adjustedDate.toISOString().split('T')[0];
};

interface EditRequestModalProps {
    request: LeaveRequest;
    onClose: () => void;
    onSave: (requestId: string, updates: {
        leaveType: LeaveType;
        startDate: Date;
        endDate: Date;
        reason: string;
    }) => Promise<void>;
}

export const EditRequestModal: React.FC<EditRequestModalProps> = ({ request, onClose, onSave }) => {
    const [leaveType, setLeaveType] = useState<LeaveType>(request.leaveType);
    const [startDate, setStartDate] = useState(formatDateForInput(request.startDate));
    const [endDate, setEndDate] = useState(formatDateForInput(request.endDate));
    const [reason, setReason] = useState(request.reason);
    const [isSaving, setIsSaving] = useState(false);

    // This effect ensures the form fields update if a different request is selected while the modal is technically still open
    useEffect(() => {
        setLeaveType(request.leaveType);
        setStartDate(formatDateForInput(request.startDate));
        setEndDate(formatDateForInput(request.endDate));
        setReason(request.reason);
    }, [request]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        if (!startDate || !endDate || !reason) {
            alert("Please fill all fields");
            setIsSaving(false);
            return;
        }
        
        // Use UTC to avoid timezone issues when comparing dates
        const start = new Date(startDate + 'T00:00:00Z');
        const end = new Date(endDate + 'T00:00:00Z');

        if(start > end) {
            alert("Start date cannot be after end date.");
            setIsSaving(false);
            return;
        }

        await onSave(request.id, {
            leaveType,
            startDate: start,
            endDate: end,
            reason,
        });
        
        setIsSaving(false);
        // The parent component will call onClose after the save is successful.
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Edit Leave Request">
            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label htmlFor="leaveTypeEdit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Leave Type</label>
                    <select id="leaveTypeEdit" value={leaveType} onChange={e => setLeaveType(e.target.value as LeaveType)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                        {LEAVE_TYPES.map(type => <option key={type}>{type}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="startDateEdit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                        <input type="date" id="startDateEdit" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="endDateEdit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                        <input type="date" id="endDateEdit" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                    </div>
                </div>
                <div>
                    <label htmlFor="reasonEdit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
                    <textarea id="reasonEdit" value={reason} onChange={e => setReason(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"></textarea>
                </div>
                <div className="flex justify-end items-center space-x-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};