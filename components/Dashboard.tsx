import React, { useState } from 'react';
import type { LeaveRequest, RequestStatus, User } from '../types';
import { StatCard } from './dashboard/StatCard';
import { RequestForm } from './dashboard/RequestForm';
import { RequestList } from './dashboard/RequestList';
import { LeaveBalanceVisualizer } from './dashboard/LeaveBalanceVisualizer';
import { EditRequestModal } from './dashboard/EditRequestModal';
import { leaveService } from '../services/leaveService';

interface DashboardProps {
  requests: LeaveRequest[];
  addRequest: (request: Omit<LeaveRequest, 'id' | 'status' | 'requester'>) => void;
  updateRequestStatus: (id: string, status: RequestStatus) => void;
  currentUser: User;
  fetchRequests: () => Promise<void>;
  setToast: (toast: { message: string, type: 'success' | 'error' } | null) => void;
}

export const Dashboard: React.FC<DashboardProps> = (props) => {
  const { currentUser, fetchRequests, setToast } = props;
  const [editingRequest, setEditingRequest] = useState<LeaveRequest | null>(null);
  
  const pendingRequests = props.requests.filter(r => r.requester.id !== currentUser.id && r.status === 'Pending').length;

  const handleUpdateRequest = async (requestId: string, updates: Partial<Omit<LeaveRequest, 'id' | 'status' | 'requester'>>) => {
    try {
      await leaveService.updateLeaveRequest(requestId, updates);
      setToast({ message: 'Request updated successfully!', type: 'success' });
      await fetchRequests();
      setEditingRequest(null);
    } catch (error) {
      console.error("Error updating request:", error);
      setToast({ message: 'Failed to update request.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LeaveBalanceVisualizer leaveBalances={currentUser.leaveBalances} />
        {(currentUser.role === "Manager" || currentUser.role === "HR") && 
          <div className="flex items-center justify-center">
            <StatCard label="Pending Team Approvals" value={pendingRequests} color="border-yellow-500" />
          </div>
        }
      </div>
      <RequestForm addRequest={props.addRequest} />
      <RequestList 
        requests={props.requests} 
        updateRequestStatus={props.updateRequestStatus} 
        currentUser={props.currentUser}
        onEditRequest={(request) => setEditingRequest(request)}
      />
      {editingRequest && (
        <EditRequestModal 
          request={editingRequest}
          onClose={() => setEditingRequest(null)}
          onSave={handleUpdateRequest}
        />
      )}
    </div>
  );
};