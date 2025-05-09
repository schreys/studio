/**
 * @fileOverview Schemas related to Google Calendar events for Genkit.
 */
import { z } from 'zod';

// Custom regex for ISO 8601 datetime string validation, as requested by the user.
const isoDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

export const CalendarEventSchema = z.object({
  id: z.string().describe('The unique identifier of the event.'),
  summary: z.string().describe('The title or summary of the event.'),
  start: z.object({
    dateTime: z.string().regex(isoDateTimeRegex, { message: "Invalid ISO 8601 datetime string for start.dateTime" }).optional().describe('The start date and time of the event (ISO 8601), if it is a timed event.'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid YYYY-MM-DD date string for start.date" }).optional().describe('The start date of the event (YYYY-MM-DD), if it is an all-day event.'),
    timeZone: z.string().optional().describe('The time zone of the start time.'),
  }),
  end: z.object({
    dateTime: z.string().regex(isoDateTimeRegex, { message: "Invalid ISO 8601 datetime string for end.dateTime" }).optional().describe('The end date and time of the event (ISO 8601), if it is a timed event.'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid YYYY-MM-DD date string for end.date" }).optional().describe('The end date of the event (YYYY-MM-DD), if it is an all-day event.'),
    timeZone: z.string().optional().describe('The time zone of the end time.'),
  }),
  htmlLink: z.string().url().describe('A link to the event in Google Calendar.'),
  description: z.string().optional().describe('A description for the event.'),
});
export type CalendarEventType = z.infer<typeof CalendarEventSchema>;

export const AddCalendarEventInputSchema = z.object({
    accessToken: z.string().optional().describe('Google OAuth access token. Optional for mock.'),
    summary: z.string().describe('The title of the event.'),
    startDateTime: z.string().datetime({ message: "Input startDateTime must be a valid ISO 8601 datetime string." }).describe('Start date and time in ISO 8601 format.'),
    endDateTime: z.string().datetime({ message: "Input endDateTime must be a valid ISO 8601 datetime string." }).describe('End date and time in ISO 8601 format.'),
    description: z.string().optional().describe('A description for the event.'),
  });
export type AddCalendarEventInput = z.infer<typeof AddCalendarEventInputSchema>;
  
export const AddCalendarEventOutputSchema = z.object({
    event: CalendarEventSchema.describe("The created calendar event.")
});
export type AddCalendarEventOutput = z.infer<typeof AddCalendarEventOutputSchema>;

