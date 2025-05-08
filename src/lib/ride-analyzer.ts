import type { Weather } from '@/services/weather';

export interface RideAnalysis {
  isGoodDay: boolean;
  message: string;
  reason?: string;
  weatherSummary: string;
}

const TEMP_MIN_C = 10;
const TEMP_MAX_C = 30;
const PRECIPITATION_MAX_MM = 0.5; 
const WIND_SPEED_MAX_KMH = 25;

function formatWeatherSummary(weather: Weather): string {
  return `Temp: ${weather.temperatureCelsius}°C, Precipitation: ${weather.precipitationMm}mm, Wind: ${weather.windSpeedKmh}km/h`;
}

export function analyzeRideConditions(weather: Weather): RideAnalysis {
  if (weather.temperatureCelsius < TEMP_MIN_C) {
    return {
      isGoodDay: false,
      message: "It's too cold!",
      reason: `The temperature is ${weather.temperatureCelsius}°C, which is below the comfortable minimum of ${TEMP_MIN_C}°C.`,
      weatherSummary: formatWeatherSummary(weather),
    };
  }
  if (weather.temperatureCelsius > TEMP_MAX_C) {
    return {
      isGoodDay: false,
      message: "It's too hot!",
      reason: `The temperature is ${weather.temperatureCelsius}°C, which is above the comfortable maximum of ${TEMP_MAX_C}°C.`,
      weatherSummary: formatWeatherSummary(weather),
    };
  }
  if (weather.precipitationMm > PRECIPITATION_MAX_MM) {
    return {
      isGoodDay: false,
      message: "Rain predicted!",
      reason: `Precipitation is ${weather.precipitationMm}mm, exceeding the preferred maximum of ${PRECIPITATION_MAX_MM}mm.`,
      weatherSummary: formatWeatherSummary(weather),
    };
  }
  if (weather.windSpeedKmh > WIND_SPEED_MAX_KMH) {
    return {
      isGoodDay: false,
      message: "Too windy!",
      reason: `Wind speed is ${weather.windSpeedKmh}km/h, which is over the comfortable limit of ${WIND_SPEED_MAX_KMH}km/h.`,
      weatherSummary: formatWeatherSummary(weather),
    };
  }

  return {
    isGoodDay: true,
    message: "Perfect day for a ride!",
    weatherSummary: formatWeatherSummary(weather),
  };
}
