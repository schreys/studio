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
 * Represents weather information, including temperature, precipitation, and wind speed.
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
 * Asynchronously retrieves weather information for a given location.
 *
 * THIS IS A MOCK IMPLEMENTATION.
 * In a real application, this function would call a weather API service.
 *
 * @param location The location for which to retrieve weather data.
 * @returns A promise that resolves to a Weather object containing temperature, precipitation and wind speed.
 * @throws Error if the API call fails or data is malformed.
 */
export async function getWeather(location: Location): Promise<Weather> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Simulate potential API errors
  // if (Math.random() < 0.1) { // 10% chance of error
  //   throw new Error("Mock API Error: Failed to fetch weather data.");
  // }

  // Simulate varied weather conditions for testing
  const conditions = [
    { temperatureCelsius: 22, precipitationMm: 0, windSpeedKmh: 12 }, // Good
    { temperatureCelsius: 5, precipitationMm: 0, windSpeedKmh: 10 },  // Too cold
    { temperatureCelsius: 35, precipitationMm: 0, windSpeedKmh: 5 }, // Too hot
    { temperatureCelsius: 18, precipitationMm: 2, windSpeedKmh: 15 },  // Rainy
    { temperatureCelsius: 20, precipitationMm: 0, windSpeedKmh: 30 },  // Windy
    { temperatureCelsius: 15, precipitationMm: 0.2, windSpeedKmh: 8 }, // Good
  ];

  const randomIndex = Math.floor(Math.random() * conditions.length);
  
  console.log(`Fetching weather for: ${location.lat}, ${location.lng} (Mocked)`);
  
  return conditions[randomIndex];
}
