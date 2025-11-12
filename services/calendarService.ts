import type { LeaveRequest, User } from '../types';

// FIX: Declare gapi and google as namespaces to provide types for the Google API and prevent TypeScript errors.
declare namespace gapi {
  function load(features: string, callback: () => void): void;
  const client: any;
  namespace auth2 {
    interface BasicProfile {
      getName(): string;
      getEmail(): string;
      getImageUrl(): string;
    }
  }
}

// FIX: Replace incorrect 'const' declaration with nested namespaces for Google Identity Services types to resolve 'accounts' member not found error.
declare namespace google {
  namespace accounts {
    namespace oauth2 {
      interface TokenClient {
        requestAccessToken: (options?: { prompt?: string }) => void;
      }
      function initTokenClient(config: {
        client_id: string;
        scope: string;
        callback: (resp: any) => void;
        prompt?: string;
      }): TokenClient;
      function revoke(token: string, done: () => void): void;
    }
  }
}


// IMPORTANT: Replace with your actual Google Cloud project credentials.
// You can get these from the Google Cloud Console: https://console.cloud.google.com/
const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY_HERE';
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE';

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

let tokenClient: google.accounts.oauth2.TokenClient | null = null;
let gapiInited = false;
let gisInited = false;

const formatDateForCalendar = (date: Date) => {
    // Returns date in "YYYY-MM-DD" format for all-day events
    return date.toISOString().split('T')[0];
}

export const calendarService = {
  
  initClient: (
    onAuthChange: (isSignedIn: boolean, user?: gapi.auth2.BasicProfile) => void
  ): void => {
    // FIX: Add a check for placeholder credentials to provide a clear warning and prevent initialization errors.
    if (GOOGLE_API_KEY === 'YOUR_GOOGLE_API_KEY_HERE' || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      console.warn("Google Calendar service is not configured. Please provide a valid API Key and Client ID in 'services/calendarService.ts'. Calendar-related features will be disabled.");
      return;
    }
    
    // Initialize GAPI client
    gapi.load('client', async () => {
      try {
        await gapi.client.init({
          apiKey: GOOGLE_API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
      } catch (err: any) {
        // FIX: Improve error logging to provide specific details from the GAPI error object instead of '[object Object]'.
        console.error("Error initializing GAPI client:");
        if (err?.result?.error) {
          console.error(`Details: ${err.result.error.message} (Code: ${err.result.error.code})`);
          alert(`Could not initialize Google Calendar integration. Please check your API Key and ensure the Calendar API is enabled in your Google Cloud project. \n\nDetails: ${err.result.error.message}`);
        } else {
          console.error("An unknown error occurred during GAPI initialization:", err);
          alert("An unknown error occurred while initializing Google Calendar integration.");
        }
      }
    });

    // Initialize GIS client
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: async (resp: any) => {
        if (resp.error !== undefined) {
          console.error('Google sign-in error:', resp);
          throw new Error(`Google sign-in failed: ${resp.error?.details || JSON.stringify(resp.error)}`);
        }
        // GIS has automatically updated gapi.client with the new token.
        const gapiProfile = gapi.client.getToken();
        
        // This is a simplified way to get profile info without another API call.
        // For full profile, you'd call the People API.
        const simpleProfile = {
            getName: () => 'Google User',
            getEmail: () => 'Not available',
            getImageUrl: () => '',
        } as gapi.auth2.BasicProfile;

        onAuthChange(true, simpleProfile);
      },
    });
    gisInited = true;
  },

  signIn: (): void => {
    if (!tokenClient) {
      console.error("Google Identity Services client not initialized. Is the service configured correctly?");
      alert("Google Sign-In is not available. Please check the configuration.");
      return;
    }
    // Prompt the user to select a Google Account and ask for consent to share their data
    // when establishing a new session.
    tokenClient.requestAccessToken({ prompt: 'consent' });
  },

  signOut: (
    onAuthChange: (isSignedIn: boolean) => void
  ): void => {
    const token = gapi.client.getToken();
    if (token !== null) {
      google.accounts.oauth2.revoke(token.access_token, () => {});
      gapi.client.setToken(null);
      onAuthChange(false);
    }
  },

  createLeaveEvent: async (request: LeaveRequest, currentUser: User): Promise<string> => {
     if (!gapiInited || !gisInited || !gapi.client.getToken()) {
        throw new Error('Google Calendar API not initialized or user not signed in.');
     }

     const event = {
        summary: `${request.leaveType} Leave - ${request.requester.name}`,
        description: `Reason: ${request.reason}`,
        start: {
            date: formatDateForCalendar(request.startDate),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
            // For all-day events, the end date is exclusive. So add one day.
            date: formatDateForCalendar(new Date(request.endDate.getTime() + 24 * 60 * 60 * 1000)),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        attendees: [
            { email: request.requester.email },
            // The event is on the current user's calendar, so they are the organizer.
            // No need to add them as an attendee explicitly unless desired.
        ],
        reminders: {
            useDefault: false,
        },
     };

     try {
        const response = await gapi.client.calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            sendUpdates: 'all',
        });
        console.log('Event created:', response.result);
        return response.result.id;
     } catch (err) {
        console.error('Error creating calendar event:', err);
        throw new Error('Failed to create calendar event.');
     }
  },

  deleteLeaveEvent: async (eventId: string): Promise<void> => {
    if (!gapiInited || !gisInited || !gapi.client.getToken()) {
      throw new Error('Google Calendar API not initialized or user not signed in.');
    }
    try {
      await gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
        sendUpdates: 'all',
      });
      console.log(`Event with ID ${eventId} deleted.`);
    } catch (err) {
      console.error(`Error deleting calendar event ${eventId}:`, err);
      throw new Error('Failed to delete calendar event.');
    }
  }
};