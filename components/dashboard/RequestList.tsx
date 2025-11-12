
import React, { useState } from 'react';
import type { LeaveRequest, RequestStatus, User } from '../../types';
import { Button } from '../common/Button';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface RequestListProps {
    requests: LeaveRequest[];
    updateRequestStatus: (id: string, status: RequestStatus) => void;
    currentUser: User;
    onEditRequest: (request: LeaveRequest) => void;
}

export const RequestList: React.FC<RequestListProps> = ({ requests, updateRequestStatus, currentUser, onEditRequest }) => {
  const [requestToCancel, setRequestToCancel] = useState<LeaveRequest | null>(null);

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Canceled': return 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-300';
    }
  };

  const isManager = currentUser.role === 'Manager' || currentUser.role === 'HR';

  const handleConfirmCancel = () => {
    if (requestToCancel) {
      updateRequestStatus(requestToCancel.id, 'Canceled');
      setRequestToCancel(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Leave Requests History</h3>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        {isManager && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee</th>}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dates</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {requests.map(req => (
                        <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            {isManager && <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img className="h-10 w-10 rounded-full" src={req.requester.avatarUrl} alt="" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium">{req.requester.name}</div>
                                </div>
                              </div>
                            </td>}
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{req.leaveType}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{req.startDate.toLocaleDateString()} - {req.endDate.toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(req.status)}`}>
                                    {req.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                    {isManager && req.status === 'Pending' && req.requester.id !== currentUser.id && (
                                        <>
                                            <Button onClick={() => updateRequestStatus(req.id, 'Approved')} variant="secondary" size="sm" className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200">Approve</Button>
                                            <Button onClick={() => updateRequestStatus(req.id, 'Rejected')} variant="secondary" size="sm" className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200">Reject</Button>
                                        </>
                                    )}
                                    {req.requester.id === currentUser.id && req.status === 'Pending' && (
                                        <>
                                            <Button onClick={() => onEditRequest(req)} variant="secondary" size="sm">
                                                Edit
                                            </Button>
                                            <Button onClick={() => setRequestToCancel(req)} variant="danger" size="sm">
                                                Cancel
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {requestToCancel && (
            <ConfirmationModal
                isOpen={!!requestToCancel}
                onClose={() => setRequestToCancel(null)}
                onConfirm={handleConfirmCancel}
                title="Confirm Cancellation"
                message={`Are you sure you want to cancel your ${requestToCancel.leaveType.toLowerCase()} leave request from ${requestToCancel.startDate.toLocaleDateString()} to ${requestToCancel.endDate.toLocaleDateString()}? This action cannot be undone.`}
                confirmButtonText="Yes, Cancel Request"
            />
        )}
    </div>
  );
};
