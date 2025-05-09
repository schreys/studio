/**
 * @fileOverview Configuration for Google API interactions.
 */

export const googleApiConfig = {
  /**
   * Google OAuth Client ID.
   * Read from environment variables.
   * Required for Google Sign-In and API access.
   */
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",

  /**
   * Scopes required for the application.
   * - 'https://www.googleapis.com/auth/calendar.events': To create and modify calendar events.
   * - 'https://www.googleapis.com/auth/calendar.readonly': To read calendar events (can be useful for future features).
   */
  scopes: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly',
};
