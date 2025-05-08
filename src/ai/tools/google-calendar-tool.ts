/**
 * @fileOverview Genkit tool for interacting with Google Calendar (mocked).
 */
import { ai } from '@/ai/genkit';
import { addCalendarEvent as addMockCalendarEvent } from '@/services/google-calendar';
import type { MockCalendarEvent } from '@/services/google-calendar';
import { AddCalendarEventInputSchema, AddCalendarEventOutputSchema } from '@/ai/schemas/calendar-event-schema';

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
