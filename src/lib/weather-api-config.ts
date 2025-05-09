/**
 * @fileOverview Configuration for the weather API.
 */

export const weatherApiConfig = {
  /**
   * API key for the weather service.
   * It's recommended to store this in environment variables.
   * Example: process.env.WEATHER_API_KEY
   */
  apiKey: process.env.NEXT_PUBLIC_WEATHER_API_KEY, // Use NEXT_PUBLIC_ prefix for client-side access if needed, otherwise just process.env
  
  /**
   * Base URL for the weather API.
   * Example: 'https://api.weatherapi.com/v1' for WeatherAPI.com
   */
  baseUrl: 'https://api.weatherapi.com/v1',
};
