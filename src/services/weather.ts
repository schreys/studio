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

/**
 * Transforms the raw API response from WeatherAPI.com into an array of DailyWeather objects.
 * @param apiForecastDays - The 'forecastday' array from the WeatherAPI.com response.
 * @returns An array of DailyWeather objects.
 */
export function transformApiResponse(apiForecastDays: any[]): DailyWeather[] {
  return apiForecastDays.map(day => ({
    date: day.date, // YYYY-MM-DD format from API
    temperatureCelsius: day.day.avgtemp_c,
    precipitationMm: day.day.totalprecip_mm,
    windSpeedKmh: day.day.maxwind_kph,
  }));
}


/**
 * MOCK IMPLEMENTATION for fallback or testing.
 * Asynchronously retrieves a 7-day weather forecast for a given location.
 *
 * @param location The location for which to retrieve weather data.
 * @returns A promise that resolves to an array of DailyWeather objects for the next 7 days.
 */
export async function getMockWeekForecast(location: Location): Promise<DailyWeather[]> {
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

