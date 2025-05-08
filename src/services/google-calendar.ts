/**
 * @fileOverview Mock service for interacting with Google Calendar API.
 */

// This matches the structure in CalendarEventSchema
export interface MockCalendarEvent {
  id: string;
  summary: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  htmlLink: string;
}

/**
 * Simulates fetching upcoming Google Calendar events.
 * In a real application, this would use the Google Calendar API with an OAuth token.
 * @param _accessToken - The Google OAuth access token (unused in this mock).
 * @param maxResults - The maximum number of events to return.
 * @returns A promise that resolves to an array of mock calendar events.
 */
export async function getUpcomingEvents(
  _accessToken: string | undefined, // Parameter kept for interface consistency
  maxResults: number = 5
): Promise<MockCalendarEvent[]> {
  console.log(`Mock fetching upcoming Google Calendar events (max: ${maxResults}). Token present: ${!!_accessToken}`);
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 700));

  const now = new Date();
  const mockEvents: MockCalendarEvent[] = [
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
      start: { dateTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString() }, // In 2 days
      end: { dateTime: new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000) + (1 * 60 * 60 * 1000)).toISOString() },
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
        start: { dateTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString() }, // In 5 days
        end: { dateTime: new Date(now.getTime() + (5 * 24 * 60 * 60 * 1000) + (2 * 60 * 60 * 1000)).toISOString() },
        htmlLink: 'https://calendar.google.com/calendar/event?eid=mockevent5',
    },
  ];

  return mockEvents.slice(0, maxResults);
}

/**
 * Simulates adding an event to Google Calendar.
 * @param _accessToken - The Google OAuth access token (unused in this mock).
 * @param eventDetails - Details of the event to add.
 * @returns A promise that resolves to the mock created event.
 */
export async function addCalendarEvent(
  _accessToken: string | undefined,
  eventDetails: { summary: string; startDateTime: string; endDateTime: string; description?: string }
): Promise<MockCalendarEvent> {
  console.log('Mock adding event to Google Calendar:', eventDetails);
  await new Promise(resolve => setTimeout(resolve, 500));
  const newEvent: MockCalendarEvent = {
    id: `newEvent-${Date.now()}`,
    summary: eventDetails.summary,
    start: { dateTime: eventDetails.startDateTime },
    end: { dateTime: eventDetails.endDateTime },
    htmlLink: `https://calendar.google.com/calendar/event?eid=mockNewEvent-${Date.now()}`,
  };
  // In a real scenario, you'd post this to the API and get back the created event details.
  return newEvent;
}
