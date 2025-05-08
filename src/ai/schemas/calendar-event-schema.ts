/**
 * @fileOverview Schemas related to Google Calendar events for Genkit.
 */
import { z } from 'zod';

export const CalendarEventSchema = z.object({
  id: z.string().describe('The unique identifier of the event.'),
  summary: z.string().describe('The title or summary of the event.'),
  start: z.object({
    dateTime: z.string().datetime().describe('The start date and time of the event (ISO 8601).'),
    timeZone: z.string().optional().describe('The time zone of the start time.'),
  }),
  end: z.object({
    dateTime: z.string().datetime().describe('The end date and time of the event (ISO 8601).'),
    timeZone: z.string().optional().describe('The time zone of the end time.'),
  }),
  htmlLink: z.string().url().describe('A link to the event in Google Calendar.'),
});
export type CalendarEventType = z.infer<typeof CalendarEventSchema>;

export const AddCalendarEventInputSchema = z.object({
    accessToken: z.string().optional().describe('Google OAuth access token. Optional for mock.'),
    summary: z.string().describe('The title of the event.'),
    startDateTime: z.string().datetime().describe('Start date and time in ISO 8601 format.'),
    endDateTime: z.string().datetime().describe('End date and time in ISO 8601 format.'),
    description: z.string().optional().describe('A description for the event.'),
  });
export type AddCalendarEventInput = z.infer<typeof AddCalendarEventInputSchema>;
  
export const AddCalendarEventOutputSchema = z.object({
    event: CalendarEventSchema.describe("The created calendar event.")
});
export type AddCalendarEventOutput = z.infer<typeof AddCalendarEventOutputSchema>;
