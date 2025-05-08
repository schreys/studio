'use server';
/**
 * @fileOverview Flow to add events to Google Calendar.
 *
 * - addEventToCalendar: An async function to add an event to the calendar.
 */

import { ai } from '@/ai/genkit';
import { addEventToCalendarTool } from '@/ai/tools/google-calendar-tool';
import { 
    AddCalendarEventInputSchema,
    AddCalendarEventOutputSchema,
    type AddCalendarEventInput,
    type AddCalendarEventOutput
} from '@/ai/schemas/calendar-event-schema';


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
