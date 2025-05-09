/**
 * @fileOverview Genkit tool for interacting with Google Calendar.
 */
import { ai } from '@/ai/genkit';
import { addCalendarEvent } from '@/services/google-calendar';
import type { CalendarEvent as ServiceCalendarEvent } from '@/services/google-calendar'; // Alias to avoid name clash
import { AddCalendarEventInputSchema, AddCalendarEventOutputSchema, CalendarEventSchema } from '@/ai/schemas/calendar-event-schema';
import { z } from 'zod';

export const addEventToCalendarTool = ai.defineTool(
  {
    name: 'addEventToCalendar',
    description: 'Adds an event to the user\'s Google Calendar. Requires OAuth access token.',
    inputSchema: AddCalendarEventInputSchema,
    outputSchema: AddCalendarEventOutputSchema,
  },
  async (input) => {
    // The addCalendarEvent service now makes a real API call
    const createdEventService: ServiceCalendarEvent = await addCalendarEvent(input.accessToken, {
      summary: input.summary,
      startDateTime: input.startDateTime,
      endDateTime: input.endDateTime,
      description: input.description,
    });

    // Ensure the event structure from the API aligns with CalendarEventSchema.
    // The CalendarEvent type from the service should already be compatible due to recent changes.
    const parsedEvent = CalendarEventSchema.safeParse(createdEventService);
    if (!parsedEvent.success) {
      console.error("Failed to parse event from Google Calendar API into schema. Issues:", parsedEvent.error.issues);
      // For more structured logging, you could use:
      // console.error("Detailed parsing errors:", JSON.stringify(parsedEvent.error.format(), null, 2));
      throw new Error("Received an unexpected event structure from Google Calendar API.");
    }

    return { event: parsedEvent.data };
  }
);

