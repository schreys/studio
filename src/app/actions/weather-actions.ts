'use server';

import type { Location, DailyWeather } from '@/services/weather';
import { transformApiResponse, getMockWeekForecast } from '@/services/weather';
import { weatherApiConfig } from '@/lib/weather-api-config';
import axios from 'axios';

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

/**
 * Server action to fetch a 7-day weather forecast for a given location.
 * Implements retry logic and falls back to mock data if the API key is missing or calls fail.
 * @param location The location for which to retrieve weather data.
 * @returns A promise that resolves to an array of DailyWeather objects.
 * @throws Error if fetching and fallback to mock both fail (should be rare).
 */
export async function fetchWeekForecastAction(location: Location): Promise<DailyWeather[]> {
  if (!weatherApiConfig.apiKey) {
    console.error("Weather API key is not configured. Falling back to mock data.");
    return getMockWeekForecast(location);
  }

  const apiUrl = `${weatherApiConfig.baseUrl}/forecast.json?key=${weatherApiConfig.apiKey}&q=${location.lat},${location.lng}&days=7&aqi=no&alerts=no`;
  let attempts = 0;

  while (attempts <= MAX_RETRIES) {
    try {
      console.log(`Fetching 7-day forecast from WeatherAPI.com (Attempt ${attempts + 1}) for: ${location.lat}, ${location.lng}`);
      const response = await axios.get(apiUrl, { timeout: 5000 }); // Adding a timeout

      if (response.data && response.data.forecast && response.data.forecast.forecastday) {
        return transformApiResponse(response.data.forecast.forecastday);
      } else {
        // This case implies a 2xx response but unexpected data structure.
        console.error(`Unexpected API response structure (Attempt ${attempts + 1}):`, response.data);
        // We might not want to retry this specific error, but for simplicity of the loop, we will.
        // If it's the last attempt, it will fall through to the error handling below or mock data.
        if (attempts === MAX_RETRIES) {
            throw new Error("Failed to parse weather data from API after multiple attempts.");
        }
      }
    } catch (error: any) {
      console.error(`Weather API call attempt ${attempts + 1} failed:`, error.message);

      // Check if it's an Axios error and if we should not retry (e.g., 4xx client errors other than 429)
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        if (status >= 400 && status < 500 && status !== 429) { // 429 is "Too Many Requests"
          console.error(`Client error ${status} from Weather API. Not retrying. Falling back to mock data.`);
          return getMockWeekForecast(location); // Fallback for non-retryable client errors
        }
      }
      // For network errors or server errors (5xx, 429), we continue to retry.
      if (attempts === MAX_RETRIES) {
        console.error("Max retries reached for Weather API. Falling back to mock data.");
        return getMockWeekForecast(location); // Fallback after all retries failed
      }
    }
    attempts++;
    if (attempts <= MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempts)); // Incremental backoff
    }
  }
  // This line should ideally not be reached if logic is correct, but acts as a final fallback.
  console.error("Exited retry loop unexpectedly. Falling back to mock data.");
  return getMockWeekForecast(location);
}
