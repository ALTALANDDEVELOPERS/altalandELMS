import type { User, LeaveRequest, LeaveType, RequestStatus } from './types';

export const LEAVE_TYPES: LeaveType[] = ['Vacation', 'Sick', 'Personal', 'Unpaid'];
export const REQUEST_STATUSES: RequestStatus[] = ['Pending', 'Approved', 'Rejected', 'Canceled'];

export const DEFAULT_LEAVE_ALLOWANCES = {
  vacation: 20,
  sick: 10,
  personal: 5,
};

export const MOCK_USER: User = {
  id: 'user-1',
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  role: 'Manager',
  avatarUrl: 'https://picsum.photos/seed/alex/100/100',
  leaveBalances: {
    vacation: 15,
    sick: 10,
    personal: 5,
  },
};

export const MOCK_TEAM: User[] = [
    {
      id: 'user-2',
      name: 'Maria Garcia',
      email: 'maria.garcia@example.com',
      role: 'Employee',
      avatarUrl: 'https://picsum.photos/seed/maria/100/100',
      leaveBalances: { vacation: 12, sick: 8, personal: 5 },
      managerId: 'user-1',
    },
    {
      id: 'user-3',
      name: 'Sam Chen',
      email: 'sam.chen@example.com',
      role: 'Employee',
      avatarUrl: 'https://picsum.photos/seed/sam/100/100',
      leaveBalances: { vacation: 18, sick: 10, personal: 3 },
      managerId: 'user-1',
    },
];

export const MOCK_REQUESTS: LeaveRequest[] = [
  {
    id: 'req-1',
    requester: MOCK_TEAM[0],
    leaveType: 'Vacation',
    startDate: new Date(new Date().setDate(new Date().getDate() + 10)),
    endDate: new Date(new Date().setDate(new Date().getDate() + 15)),
    reason: 'Family trip to the Grand Canyon.',
    status: 'Pending',
    submissionDate: new Date(new Date().setDate(new Date().getDate() - 2)),
  },
  {
    id: 'req-2',
    requester: MOCK_TEAM[1],
    leaveType: 'Sick',
    startDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    endDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    reason: 'Feeling unwell, doctor\'s appointment scheduled.',
    status: 'Approved',
    submissionDate: new Date(new Date().setDate(new Date().getDate() - 1)),
  },
  {
    id: 'req-3',
    requester: MOCK_TEAM[0],
    leaveType: 'Personal',
    startDate: new Date(new Date().setDate(new Date().getDate() + 5)),
    endDate: new Date(new Date().setDate(new Date().getDate() + 5)),
    reason: 'Attending a personal event.',
    status: 'Rejected',
    submissionDate: new Date(new Date().setDate(new Date().getDate() - 5)),
  },
   {
    id: 'req-4',
    requester: MOCK_USER,
    leaveType: 'Vacation',
    startDate: new Date(new Date().setDate(new Date().getDate() + 20)),
    endDate: new Date(new Date().setDate(new Date().getDate() + 22)),
    reason: 'Short break.',
    status: 'Approved',
    submissionDate: new Date(new Date().setDate(new Date().getDate() - 10)),
  },
];