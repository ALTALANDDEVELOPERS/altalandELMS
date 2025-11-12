
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Employee' | 'Manager' | 'HR';
  avatarUrl: string;
  leaveBalances: {
    vacation: number;
    sick: number;
    personal: number;
  };
  managerId?: string;
}

export type LeaveType = 'Vacation' | 'Sick' | 'Personal' | 'Unpaid';
export type RequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Canceled';

export interface LeaveRequest {
  id: string;
  requester: User;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: RequestStatus;
  submissionDate: Date;
  googleCalendarEventId?: string;
}
// FIX: Add ChatMessage type for the chatbot component.
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}
