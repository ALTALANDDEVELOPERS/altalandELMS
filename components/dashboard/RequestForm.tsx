import React, { useState } from 'react';
import type { LeaveRequest, User, LeaveType } from '../../types';
import { LEAVE_TYPES } from '../../constants';
import { Button } from '../common/Button';

interface RequestFormProps {
    addRequest: (request: Omit<LeaveRequest, 'id' | 'status' | 'requester'>) => void;
}

export const RequestForm: React.FC<RequestFormProps> = ({ addRequest }) => {
  const [leaveType, setLeaveType] = useState<LeaveType>('Vacation');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
        alert("Please fill all fields");
        return;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);

    if(start > end) {
        alert("Start date cannot be after end date.");
        return;
    }

    addRequest({
      leaveType,
      startDate: start,
      endDate: end,
      reason,
      submissionDate: new Date(),
    });

    setLeaveType('Vacation');
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">New Leave Request</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Leave Type</label>
          <select id="leaveType" value={leaveType} onChange={e => setLeaveType(e.target.value as LeaveType)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
            {LEAVE_TYPES.map(type => <option key={type}>{type}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
            <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
            <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
          </div>
        </div>
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
          <textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"></textarea>
        </div>
        <div className="text-right">
          <Button type="submit">Submit Request</Button>
        </div>
      </form>
    </div>
  );
};