import type { LeaveRequest, RequestStatus, User } from '../types';
import { GOOGLE_SHEET_API_URL } from '../config';
import { MOCK_REQUESTS, MOCK_USER, MOCK_TEAM } from '../constants';

const API_URL = GOOGLE_SHEET_API_URL;

// Stateful mock implementation for development when no Google Sheet URL is provided.
let statefulMockRawRequests: any[] | null = null;

function initializeMockData() {
    if (statefulMockRawRequests !== null) return;
    // Store raw data, mimicking a database, by stripping the nested 'requester' object.
    statefulMockRawRequests = MOCK_REQUESTS.map(req => {
        const { requester, ...rest } = req;
        return { ...rest, requesterId: requester.id, id: rest.id || `mock-init-${Math.random()}` };
    });
}

async function apiRequest<T>(action: string, method: 'GET' | 'POST' = 'GET', body?: any): Promise<T> {
  if (API_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
      console.warn("Using stateful mock data for leaveService.");
      initializeMockData();

      switch(action) {
          case 'getRequests':
              return Promise.resolve([...statefulMockRawRequests!] as T);
          case 'submitRequest':
              const newRawReq = { 
                  ...body, 
                  id: `mock-${Date.now()}`, 
                  status: 'Pending',
                  submissionDate: new Date().toISOString(),
               };
              statefulMockRawRequests!.unshift(newRawReq);
              return Promise.resolve(newRawReq as T);
          case 'updateStatus':
              const { id, status } = body;
              const reqToUpdate = statefulMockRawRequests!.find(r => r.id === id);
              if (reqToUpdate) {
                  reqToUpdate.status = status;
                  return Promise.resolve(reqToUpdate as T);
              }
              return Promise.reject(new Error(`Mock request with id "${id}" not found.`));
          case 'updateRequest':
              const { requestId: updateId, updates } = body;
              const reqToModify = statefulMockRawRequests!.find(r => r.id === updateId);
              if (reqToModify) {
                  Object.assign(reqToModify, updates);
                  return Promise.resolve(reqToModify as T);
              }
              return Promise.reject(new Error(`Mock request with id "${updateId}" not found for updating.`));
          case 'linkEvent':
              const { requestId, eventId } = body;
              const reqToLink = statefulMockRawRequests!.find(r => r.id === requestId);
              if (reqToLink) {
                  reqToLink.googleCalendarEventId = eventId;
                  return Promise.resolve(reqToLink as T);
              }
               return Promise.reject(new Error(`Mock request with id "${requestId}" not found for linking.`));
          default:
              return Promise.reject(new Error(`Mock for action "${action}" not implemented.`));
      }
  }
  
  const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action, payload: body }),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
  });

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
  const data = await response.json();
  if (data.status === 'error') throw new Error(data.message);

  return data.data;
}

const parseRequest = (req: any): LeaveRequest => ({
  ...req,
  startDate: new Date(req.startDate),
  endDate: new Date(req.endDate),
  submissionDate: new Date(req.submissionDate),
});

export const leaveService = {
  getLeaveRequests: async (): Promise<LeaveRequest[]> => {
    try {
        const rawRequests = await apiRequest<any[]>('getRequests');
        const users = await leaveService.getUsers();
        
        const requestsWithUsers = rawRequests.map(req => {
            const requester = users.find(u => u.id === req.requesterId);
            return { ...req, requester: requester || MOCK_USER };
        });

        const parsedRequests = requestsWithUsers.map(parseRequest);
        return parsedRequests.sort((a, b) => b.submissionDate.getTime() - a.submissionDate.getTime());
    } catch(e) {
        console.error("Error fetching leave requests:", e);
        const message = e instanceof Error ? e.message : 'An unknown error occurred.';
        alert(`Could not fetch data from Google Sheets. Make sure your URL in config.ts is correct and the sheet is shared publicly.\n\nDetails: ${message}`);
        return [];
    }
  },

  submitLeaveRequest: async (
    requestData: Omit<LeaveRequest, 'id' | 'status'>
  ): Promise<LeaveRequest> => {
    const payload = {
        ...requestData,
        requesterId: requestData.requester.id,
        requester: undefined,
    };
    const newRequest = await apiRequest<any>('submitRequest', 'POST', payload);
    return parseRequest({ ...newRequest, requester: requestData.requester });
  },

  updateRequestStatus: async (
    id: string,
    status: RequestStatus
  ): Promise<LeaveRequest | null> => {
    const updatedRequest = await apiRequest<any>('updateStatus', 'POST', { id, status });
    if (!updatedRequest) return null;
    
    const users = await leaveService.getUsers();
    const requester = users.find(u => u.id === updatedRequest.requesterId);
    return parseRequest({ ...updatedRequest, requester: requester || MOCK_USER });
  },
  
  updateLeaveRequest: async (
    requestId: string,
    updates: Partial<Omit<LeaveRequest, 'id' | 'status' | 'requester' | 'submissionDate'>>
  ): Promise<LeaveRequest | null> => {
    const updatedRequest = await apiRequest<any>('updateRequest', 'POST', { requestId, updates });
    if (!updatedRequest) return null;

    const users = await leaveService.getUsers();
    const requester = users.find(u => u.id === updatedRequest.requesterId);
    return parseRequest({ ...updatedRequest, requester: requester || MOCK_USER });
  },

  linkCalendarEvent: async (requestId: string, eventId: string): Promise<LeaveRequest | null> => {
    const linkedRequest = await apiRequest<any>('linkEvent', 'POST', { requestId, eventId });
    if (!linkedRequest) return null;

    const users = await leaveService.getUsers();
    const requester = users.find(u => u.id === linkedRequest.requesterId);
    return parseRequest({ ...linkedRequest, requester: requester || MOCK_USER });
  },

  getUsers: async (): Promise<User[]> => {
    await new Promise(res => setTimeout(res, 100));
    return [MOCK_USER, ...MOCK_TEAM];
  }
};