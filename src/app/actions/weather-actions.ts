'use server';

import type { Location, DailyWeather } from '@/services/weather';
import { transformApiResponse, getMockWeekForecast } from '@/services/weather';
import { weatherApiConfig } from '@/lib/weather-api-config';
import axios from 'axios';

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

interface WeekForecastActionResult {
  forecast: DailyWeather[];
  locationName: string | null;
}

/**
 * Server action to fetch a 7-day weather forecast for a given location.
 * Implements retry logic and falls back to mock data if the API key is missing or calls fail.
 * @param location The location for which to retrieve weather data.
 * @returns A promise that resolves to an object containing an array of DailyWeather objects and the location name.
 * @throws Error if fetching and fallback to mock both fail (should be rare).
 */
export async function fetchWeekForecastAction(location: Location): Promise<WeekForecastActionResult> {
  if (!weatherApiConfig.apiKey) {
    console.error("Weather API key is not configured. Falling back to mock data.");
    const mockForecast = await getMockWeekForecast(location);
    return { forecast: mockForecast, locationName: "Your Location (Mock Data)" };
  }

  const apiUrl = `${weatherApiConfig.baseUrl}/forecast.json?key=${weatherApiConfig.apiKey}&q=${location.lat},${location.lng}&days=7&aqi=no&alerts=no`;
  let attempts = 0;

  while (attempts <= MAX_RETRIES) {
    try {
      console.log(`Fetching 7-day forecast from WeatherAPI.com (Attempt ${attempts + 1}) for: ${location.lat}, ${location.lng}`);
      const response = await axios.get(apiUrl, { timeout: 5000 }); // Adding a timeout

      if (response.data && response.data.forecast && response.data.forecast.forecastday) {
        const transformedData = transformApiResponse(response.data.forecast.forecastday);
        const fetchedLocationName = response.data.location?.name || null;
        return { forecast: transformedData, locationName: fetchedLocationName };
      } else {
        console.error(`Unexpected API response structure (Attempt ${attempts + 1}):`, response.data);
        if (attempts === MAX_RETRIES) {
            console.error("Failed to parse weather data from API after multiple attempts. Falling back to mock data.");
            const mockForecast = await getMockWeekForecast(location);
            return { forecast: mockForecast, locationName: "Your Location (Mock Data)" };
        }
      }
    } catch (error: any) {
      console.error(`Weather API call attempt ${attempts + 1} failed:`, error.message);

      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        if (status >= 400 && status < 500 && status !== 429) { 
          console.error(`Client error ${status} from Weather API. Not retrying. Falling back to mock data.`);
          const mockForecast = await getMockWeekForecast(location);
          return { forecast: mockForecast, locationName: "Your Location (Mock Data)" };
        }
      }
      if (attempts === MAX_RETRIES) {
        console.error("Max retries reached for Weather API. Falling back to mock data.");
        const mockForecast = await getMockWeekForecast(location);
        return { forecast: mockForecast, locationName: "Your Location (Mock Data)" };
      }
    }
    attempts++;
    if (attempts <= MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempts)); 
    }
  }
  
  console.error("Exited retry loop unexpectedly. Falling back to mock data.");
  const mockForecast = await getMockWeekForecast(location);
  return { forecast: mockForecast, locationName: "Your Location (Mock Data)" };
}
