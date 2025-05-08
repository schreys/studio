/**
 * @fileOverview Genkit tool for interacting with Google Calendar (mocked).
 */
import { ai } from '@/ai/genkit';
import { getUpcomingEvents as getMockUpcomingEvents, addCalendarEvent as addMockCalendarEvent } from '@/services/google-calendar';
import type { MockCalendarEvent } from '@/services/google-calendar';
import { UpcomingEventsInputSchema, UpcomingEventsOutputSchema, AddCalendarEventInputSchema, AddCalendarEventOutputSchema, CalendarEventSchema } from '@/ai/schemas/calendar-event-schema';

export const fetchUpcomingCalendarEventsTool = ai.defineTool(
  {
    name: 'fetchUpcomingCalendarEvents',
    description: 'Fetches a list of upcoming events from the user\'s Google Calendar. Requires OAuth access token.',
    inputSchema: UpcomingEventsInputSchema,
    outputSchema: UpcomingEventsOutputSchema,
  },
  async (input) => {
    // In a real app, use input.accessToken to make an authenticated API call.
    // Here, we call our mock service.
    const events: MockCalendarEvent[] = await getMockUpcomingEvents(input.accessToken, input.maxResults);
    // Ensure the mock events align with CalendarEventSchema if there are discrepancies.
    // For this mock, we assume MockCalendarEvent is compatible.
    return { events: events as any[] };
  }
);


export const addEventToCalendarTool = ai.defineTool(
  {
    name: 'addEventToCalendar',
    description: 'Adds an event to the user\'s Google Calendar. Requires OAuth access token.',
    inputSchema: AddCalendarEventInputSchema,
    outputSchema: AddCalendarEventOutputSchema,
  },
  async (input) => {
    const createdEvent: MockCalendarEvent = await addMockCalendarEvent(input.accessToken, {
      summary: input.summary,
      startDateTime: input.startDateTime,
      endDateTime: input.endDateTime,
      description: input.description,
    });
     // Ensure the mock event aligns with CalendarEventSchema.
    return { event: createdEvent as any };
  }
);

