/**
 * @fileOverview Service for interacting with Google Calendar API.
 */
import axios from 'axios';

// This matches the structure in CalendarEventSchema and Google Calendar API response for core fields
export interface CalendarEvent {
  id: string;
  summary: string;
  start: { 
    dateTime?: string; // ISO 8601 datetime
    date?: string;     // YYYY-MM-DD
    timeZone?: string;
  };
  end: { 
    dateTime?: string; // ISO 8601 datetime
    date?: string;     // YYYY-MM-DD
    timeZone?: string;
  };
  htmlLink: string;
  description?: string;
}

/**
 * Simulates fetching upcoming Google Calendar events (remains MOCKED).
 * In a real application, this would use the Google Calendar API with an OAuth token.
 * @param _accessToken - The Google OAuth access token (unused in this mock).
 * @param maxResults - The maximum number of events to return.
 * @returns A promise that resolves to an array of mock calendar events.
 */
export async function getUpcomingEvents(
  _accessToken: string | undefined, // Parameter kept for interface consistency
  maxResults: number = 5
): Promise<CalendarEvent[]> {
  console.log(`Mock fetching upcoming Google Calendar events (max: ${maxResults}). Token present: ${!!_accessToken}`);
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 700));

  const now = new Date();
  const mockEvents: CalendarEvent[] = [
    {
      id: 'event1',
      summary: 'Team Meeting',
      start: { dateTime: new Date(now.getTime() + 1 * 60 * 60 * 1000).toISOString() }, // 1 hour from now
      end: { dateTime: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString() },   // 2 hours from now
      htmlLink: 'https://calendar.google.com/calendar/event?eid=mockevent1',
    },
    {
      id: 'event2',
      summary: 'Bike Ride with Alex',
      start: { dateTime: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() }, // Tomorrow
      end: { dateTime: new Date(now.getTime() + 26 * 60 * 60 * 1000).toISOString() },
      htmlLink: 'https://calendar.google.com/calendar/event?eid=mockevent2',
    },
    {
      id: 'event3',
      summary: 'Project Deadline',
      start: { date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }, // In 2 days, all-day
      end: { date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },   // End date for all-day is exclusive
      htmlLink: 'https://calendar.google.com/calendar/event?eid=mockevent3',
    },
    {
        id: 'event4',
        summary: 'Dentist Appointment',
        start: { dateTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString() }, // In 3 days
        end: { dateTime: new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000) + (45 * 60 * 1000)).toISOString() },
        htmlLink: 'https://calendar.google.com/calendar/event?eid=mockevent4',
    },
    {
        id: 'event5',
        summary: 'Weekend Getaway Planning',
        start: { date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }, // In 5 days, all-day
        end: { date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        htmlLink: 'https://calendar.google.com/calendar/event?eid=mockevent5',
    },
  ];

  return mockEvents.slice(0, maxResults);
}

/**
 * Adds an event to the user's primary Google Calendar.
 * Requires a valid OAuth access token with 'https://www.googleapis.com/auth/calendar.events' scope.
 * @param accessToken - The Google OAuth access token.
 * @param eventDetails - Details of the event to add.
 * @returns A promise that resolves to the created calendar event.
 * @throws Error if the API call fails.
 */
export async function addCalendarEvent(
  accessToken: string | undefined,
  eventDetails: { summary: string; startDateTime: string; endDateTime: string; description?: string }
): Promise<CalendarEvent> {
  if (!accessToken) {
    console.error('Google Calendar API call attempted without an access token.');
    throw new Error('Access token is required to add events to Google Calendar.');
  }

  console.log('Adding event to Google Calendar using real API:', eventDetails);

  const apiUrl = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
  
  const eventData = {
    summary: eventDetails.summary,
    description: eventDetails.description,
    start: {
      dateTime: eventDetails.startDateTime,
      // You might want to specify a timeZone, e.g., from user settings or eventDate
      // timeZone: 'America/Los_Angeles', 
    },
    end: {
      dateTime: eventDetails.endDateTime,
      // timeZone: 'America/Los_Angeles',
    },
  };

  try {
    const response = await axios.post<{
      id: string;
      summary: string;
      start?: { dateTime?: string; date?: string; timeZone?: string }; // Make response fields optional
      end?: { dateTime?: string; date?: string; timeZone?: string };   // Make response fields optional
      htmlLink: string;
      description?: string;
    }>(apiUrl, eventData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Transform the Google API response to our CalendarEvent structure
    const createdEvent: CalendarEvent = {
        id: response.data.id,
        summary: response.data.summary,
        start: { 
            dateTime: response.data.start?.dateTime, 
            date: response.data.start?.date,
            timeZone: response.data.start?.timeZone 
        },
        end: { 
            dateTime: response.data.end?.dateTime,
            date: response.data.end?.date,
            timeZone: response.data.end?.timeZone
        },
        htmlLink: response.data.htmlLink,
        description: response.data.description,
    };
    return createdEvent;
  } catch (error: any) {
    console.error('Error adding event to Google Calendar:', error.response?.data || error.message);
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      const errorMessage = error.response.data?.error?.message || error.message;
      if (status === 401) {
        throw new Error(`Authentication failed: ${errorMessage}. Please ensure you have a valid access token and the necessary permissions.`);
      }
      throw new Error(`Failed to add event to Google Calendar (HTTP ${status}): ${errorMessage}`);
    }
    throw new Error(`Failed to add event to Google Calendar: ${error.message}`);
  }
}

