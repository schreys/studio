/**
 * Represents a geographical location with latitude and longitude coordinates.
 */
export interface Location {
  /**
   * The latitude of the location.
   */
  lat: number;
  /**
   * The longitude of the location.
   */
  lng: number;
}

/**
 * Represents basic weather information.
 */
export interface Weather {
  /**
   * The temperature in Celsius.
   */
  temperatureCelsius: number;
  /**
   * The amount of precipitation in mm.
   */
  precipitationMm: number;
  /**
   * The wind speed in km/h.
   */
  windSpeedKmh: number;
}

/**
 * Represents weather information for a specific day, including the date.
 */
export interface DailyWeather extends Weather {
  /**
   * The date of the weather forecast, in ISO string format (YYYY-MM-DD).
   */
  date: string;
}

// Import axios for making HTTP requests
import axios from 'axios';
import { weatherApiConfig } from '@/lib/weather-api-config';

/**
 * Transforms the raw API response from WeatherAPI.com into an array of DailyWeather objects.
 * @param apiForecastDays - The 'forecastday' array from the WeatherAPI.com response.
 * @returns An array of DailyWeather objects.
 */
function transformApiResponse(apiForecastDays: any[]): DailyWeather[] {
  return apiForecastDays.map(day => ({
    date: day.date, // YYYY-MM-DD format from API
    temperatureCelsius: day.day.avgtemp_c,
    precipitationMm: day.day.totalprecip_mm,
    windSpeedKmh: day.day.maxwind_kph,
  }));
}


/**
 * Asynchronously retrieves a 7-day weather forecast for a given location using WeatherAPI.com.
 *
 * @param location The location for which to retrieve weather data.
 * @returns A promise that resolves to an array of DailyWeather objects for the next 7 days.
 * @throws Error if the API call fails or data is malformed.
 */
export async function getWeekForecast(location: Location): Promise<DailyWeather[]> {
  if (!weatherApiConfig.apiKey) {
    console.error("Weather API key is not configured. Falling back to mock data.");
    return getMockWeekForecast(location); // Fallback to mock if API key is missing
  }

  const apiUrl = `${weatherApiConfig.baseUrl}/forecast.json?key=${weatherApiConfig.apiKey}&q=${location.lat},${location.lng}&days=7&aqi=no&alerts=no`;

  try {
    console.log(`Fetching 7-day forecast from WeatherAPI.com for: ${location.lat}, ${location.lng}`);
    const response = await axios.get(apiUrl);
    
    if (response.data && response.data.forecast && response.data.forecast.forecastday) {
      return transformApiResponse(response.data.forecast.forecastday);
    } else {
      console.error("Unexpected API response structure:", response.data);
      throw new Error("Failed to parse weather data from API.");
    }
  } catch (error) {
    console.error("Failed to fetch real weather forecast:", error);
    // Fallback to mock data in case of an error with the real API
    console.warn("Falling back to mock weather data due to API error.");
    return getMockWeekForecast(location);
  }
}


/**
 * MOCK IMPLEMENTATION for fallback or testing.
 * Asynchronously retrieves a 7-day weather forecast for a given location.
 *
 * @param location The location for which to retrieve weather data.
 * @returns A promise that resolves to an array of DailyWeather objects for the next 7 days.
 */
async function getMockWeekForecast(location: Location): Promise<DailyWeather[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 600));

  console.log(`Fetching 7-day forecast for: ${location.lat}, ${location.lng} (Mocked)`);

  const forecast: DailyWeather[] = [];
  const today = new Date();

  const baseConditions = [
    { temperatureCelsius: 22, precipitationMm: 0, windSpeedKmh: 12 }, // Good
    { temperatureCelsius: 18, precipitationMm: 0.2, windSpeedKmh: 8 }, // Good
    { temperatureCelsius: 25, precipitationMm: 0, windSpeedKmh: 15 }, // Good
    { temperatureCelsius: 5, precipitationMm: 0, windSpeedKmh: 10 },  // Too cold
    { temperatureCelsius: 35, precipitationMm: 0, windSpeedKmh: 5 }, // Too hot
    { temperatureCelsius: 18, precipitationMm: 2, windSpeedKmh: 15 },  // Rainy
    { temperatureCelsius: 20, precipitationMm: 0, windSpeedKmh: 30 },  // Windy
  ];

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);
    
    const condition = baseConditions[i % baseConditions.length]; 
    const dailyVariationTemp = Math.random() * 4 - 2; 
    const dailyVariationPrecip = Math.random() * 0.5 - 0.1; 
    const dailyVariationWind = Math.random() * 5 - 2.5;


    forecast.push({
      date: currentDate.toISOString().split('T')[0], 
      temperatureCelsius: parseFloat((condition.temperatureCelsius + dailyVariationTemp).toFixed(1)),
      precipitationMm: Math.max(0, parseFloat((condition.precipitationMm + dailyVariationPrecip).toFixed(1))),
      windSpeedKmh: Math.max(0, parseFloat((condition.windSpeedKmh + dailyVariationWind).toFixed(1))),
    });
  }

  return forecast;
}
