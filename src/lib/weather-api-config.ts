/**
 * @fileOverview Configuration for the weather API.
 */

export const weatherApiConfig = {
  /**
   * API key for the weather service.
   * This is read from environment variables.
   * While prefixed with NEXT_PUBLIC_, it's now primarily used server-side in a Server Action
   * to keep it secure.
   * Example: process.env.NEXT_PUBLIC_WEATHER_API_KEY
   */
  apiKey: process.env.NEXT_PUBLIC_WEATHER_API_KEY,
  
  /**
   * Base URL for the weather API.
   * Example: 'https://api.weatherapi.com/v1' for WeatherAPI.com
   */
  baseUrl: 'https://api.weatherapi.com/v1',
};

