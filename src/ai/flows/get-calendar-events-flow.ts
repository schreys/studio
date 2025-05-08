'use server';
/**
 * @fileOverview Flow to retrieve upcoming Google Calendar events and add events.
 *
 * - getCalendarEvents: An async function that retrieves upcoming calendar events.
 * - addEventToCalendar: An async function to add an event to the calendar.
 */

import { ai } from '@/ai/genkit';
import { fetchUpcomingCalendarEventsTool, addEventToCalendarTool } from '@/ai/tools/google-calendar-tool';
import { 
    UpcomingEventsInputSchema, 
    UpcomingEventsOutputSchema, 
    type UpcomingEventsInput, 
    type UpcomingEventsOutput,
    AddCalendarEventInputSchema,
    AddCalendarEventOutputSchema,
    type AddCalendarEventInput,
    type AddCalendarEventOutput
} from '@/ai/schemas/calendar-event-schema';

export async function getCalendarEvents(input: UpcomingEventsInput): Promise<UpcomingEventsOutput> {
  return getCalendarEventsFlow(input);
}

const getCalendarEventsFlow = ai.defineFlow(
  {
    name: 'getCalendarEventsFlow',
    inputSchema: UpcomingEventsInputSchema,
    outputSchema: UpcomingEventsOutputSchema,
  },
  async (input) => {
    // This flow currently just calls the tool. It could be expanded to include more logic.
    const toolOutput = await fetchUpcomingCalendarEventsTool(input);
    return toolOutput; 
  }
);

export async function addEventToCalendar(input: AddCalendarEventInput): Promise<AddCalendarEventOutput> {
    return addEventToCalendarFlow(input);
}

const addEventToCalendarFlow = ai.defineFlow(
    {
        name: 'addEventToCalendarFlow',
        inputSchema: AddCalendarEventInputSchema,
        outputSchema: AddCalendarEventOutputSchema,
    },
    async (input) => {
        const toolOutput = await addEventToCalendarTool(input);
        return toolOutput;
    }
);

