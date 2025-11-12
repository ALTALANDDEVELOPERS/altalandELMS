
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Analytics } from './components/Analytics';
import { CalendarView } from './components/CalendarView';
import { LiveAssistant } from './components/LiveAssistant';
import { leaveService } from './services/leaveService';
import { calendarService } from './services/calendarService';
import { notificationService } from './services/notificationService';
import type { LeaveRequest, RequestStatus, User } from './types';
import { MOCK_USER } from './constants';
import { Mic } from './components/Icons';
import { Toast } from './components/common/Toast';
import { Chatbot } from './components/Chatbot';

// FIX: Add gapi and google to the window type to resolve TypeScript errors for Google API scripts.
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

type View = 'dashboard' | 'analytics' | 'calendar';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [user] = useState<User>(MOCK_USER);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLiveAssistantOpen, setLiveAssistantOpen] = useState(false);
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);


  const fetchRequests = useCallback(async () => {
    const fetchedRequests = await leaveService.getLeaveRequests();
    setRequests(fetchedRequests);
  }, []);

  const fetchUsers = useCallback(async () => {
    const fetchedUsers = await leaveService.getUsers();
    setAllUsers(fetchedUsers);
  }, []);

  useEffect(() => {
    fetchRequests();
    fetchUsers();
  }, [fetchRequests, fetchUsers]);

  useEffect(() => {
    const handleGapiLoad = () => {
        calendarService.initClient((isSignedIn) => {
            setIsGoogleSignedIn(isSignedIn);
        });
    };
    // The google scripts are loaded asynchronously. We need to wait for them.
    // A simple timeout is not robust, but for this environment it's a pragmatic solution.
    const gapiCheck = setInterval(() => {
        if (window.gapi && window.google) {
            clearInterval(gapiCheck);
            handleGapiLoad();
        }
    }, 100);

    return () => clearInterval(gapiCheck);
  }, []);

  const addRequest = async (request: Omit<LeaveRequest, 'id' | 'status' | 'requester'>) => {
    const newRequest = await leaveService.submitLeaveRequest({
      ...request,
      requester: user,
    });
    setRequests(prev => [newRequest, ...prev]);
    fetchRequests(); 
    setToast({ message: 'Leave request submitted successfully!', type: 'success' });
  };
  
  const updateRequestStatus = async (id: string, status: RequestStatus) => {
    const originalRequest = requests.find(r => r.id === id);
    if (!originalRequest) {
      setToast({ message: 'Error: Could not find the request to update.', type: 'error' });
      return;
    }

    const updatedRequest = await leaveService.updateRequestStatus(id, status);

    if (!updatedRequest) {
      setToast({ message: 'Failed to update request status.', type: 'error' });
      return;
    }

    // Send email notification
    notificationService.sendLeaveStatusUpdateEmail(updatedRequest, allUsers);

    // Handle Google Calendar synchronization
    if (status === 'Approved' && isGoogleSignedIn) {
      try {
        const eventId = await calendarService.createLeaveEvent(updatedRequest, user);
        if (eventId) {
          await leaveService.linkCalendarEvent(id, eventId);
          setToast({ message: 'Request approved and added to calendar.', type: 'success' });
        } else {
          setToast({ message: 'Request approved, but failed to create calendar event.', type: 'error' });
        }
      } catch (error) {
        console.error("Calendar creation error:", error);
        setToast({ message: 'Request approved, but failed to add to calendar.', type: 'error' });
      }
    } else if ((status === 'Rejected' || status === 'Canceled') && isGoogleSignedIn && originalRequest.googleCalendarEventId) {
      try {
        await calendarService.deleteLeaveEvent(originalRequest.googleCalendarEventId);
        setToast({ message: `Request ${status.toLowerCase()} and calendar event removed.`, type: 'success' });
      } catch (error) {
        console.error("Calendar deletion error:", error);
        setToast({ message: `Request ${status.toLowerCase()}, but failed to remove from calendar.`, type: 'error' });
      }
    } else {
      setToast({ message: `Request has been ${status.toLowerCase()}.`, type: 'success' });
    }

    fetchRequests(); // Re-fetch all data to ensure UI is in sync with the state
  };

  const handleGoogleSignIn = () => calendarService.signIn();
  const handleGoogleSignOut = () => calendarService.signOut(() => setIsGoogleSignedIn(false));

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        user={user} 
        setView={setView} 
        currentView={view} 
        isGoogleSignedIn={isGoogleSignedIn}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
      />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        {view === 'dashboard' && (
          <Dashboard 
            requests={requests} 
            addRequest={addRequest} 
            updateRequestStatus={updateRequestStatus} 
            currentUser={user}
            fetchRequests={fetchRequests}
            setToast={setToast}
          />
        )}
        {view === 'analytics' && <Analytics allRequests={requests} currentUser={user} updateRequestStatus={updateRequestStatus} />}
        {view === 'calendar' && <CalendarView requests={requests} currentUser={user} allUsers={allUsers} />}
      </main>
      
      <div className="fixed bottom-6 right-6 flex items-center space-x-4">
         <Chatbot />
         <button
          onClick={() => setLiveAssistantOpen(true)}
          className="bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-transform transform hover:scale-110"
          aria-label="Open Live Assistant"
        >
          <Mic className="w-6 h-6" />
        </button>
      </div>

      {isLiveAssistantOpen && (
        <LiveAssistant
          isOpen={isLiveAssistantOpen}
          onClose={() => setLiveAssistantOpen(false)}
          onLeaveRequest={(details) => {
            const { leaveType, startDate, endDate, reason } = details;
             addRequest({
                leaveType: leaveType,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                reason: reason,
                submissionDate: new Date(),
            });
            setLiveAssistantOpen(false);
          }}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  );
}
