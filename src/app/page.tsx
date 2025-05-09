'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Location, DailyWeather } from '@/services/weather';
import { fetchWeekForecastAction } from '@/app/actions/weather-actions'; 
import type { RideAnalysis } from '@/lib/ride-analyzer';
import { analyzeRideConditions } from '@/lib/ride-analyzer';
import WeekForecastCard from '@/components/bike-buddy/week-forecast-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MOCK_ACCESS_TOKEN_KEY = 'mock_google_access_token';

export type ForecastItem = DailyWeather & { analysis: RideAnalysis };

export default function BikeBuddyPage() {
  const [location, setLocation] = useState<Location | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [forecastData, setForecastData] = useState<ForecastItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);


  useEffect(() => {
    const storedToken = localStorage.getItem(MOCK_ACCESS_TOKEN_KEY);
    if (storedToken) {
      setGoogleAccessToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLoadingLocation(false);
          setError(null); 
        },
        (err) => {
          console.error("Error getting location:", err);
          setError("Could not get your location. Please enable location services and refresh. Defaulting to a sample location for now.");
          setLocation({ lat: 34.0522, lng: -118.2437 }); // Los Angeles
          setIsLoadingLocation(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser. Defaulting to a sample location.");
      setLocation({ lat: 34.0522, lng: -118.2437 }); // Los Angeles
      setIsLoadingLocation(false);
    }
  }, []);

  const fetchForecast = useCallback(async () => {
    if (!location) return;

    setIsLoadingForecast(true);
    if (!error?.includes("location")) {
        setError(null);
    }
    try {
      const { forecast: dailyWeatherData, locationName: fetchedLocationName } = await fetchWeekForecastAction(location);
      
      const analyzedForecast = dailyWeatherData.map(dailyWeather => ({
        ...dailyWeather,
        analysis: analyzeRideConditions(dailyWeather),
      }));
      setForecastData(analyzedForecast);
      setLocationName(fetchedLocationName);
    } catch (e: any) { 
      console.error("Failed to get forecast or analyze conditions:", e);
      setError((prevError) => prevError || e.message || "Could not fetch weather forecast. Please try again later.");
      setForecastData(null);
      setLocationName(null);
    } finally {
      setIsLoadingForecast(false);
    }
  }, [location, error]);

  useEffect(() => {
    if (location) {
      fetchForecast();
    }
  }, [location, fetchForecast]);

  const handleConnectCalendar = () => {
    setIsAuthLoading(true);
    setTimeout(() => {
      const mockToken = `mock-token-${Date.now()}`;
      localStorage.setItem(MOCK_ACCESS_TOKEN_KEY, mockToken);
      setGoogleAccessToken(mockToken);
      setIsAuthLoading(false);
    }, 1000); 
  };

  const handleDisconnectCalendar = () => {
    localStorage.removeItem(MOCK_ACCESS_TOKEN_KEY);
    setGoogleAccessToken(null);
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8 selection:bg-primary/20 selection:text-primary">
      <header className="my-8 text-center">
        <h1 className="text-5xl font-bold text-primary">Bike Buddy</h1>
        <p className="text-lg text-muted-foreground mt-2">Your AI companion for planning the perfect bike ride, week by week.</p>
      </header>
      
      <div className="w-full max-w-4xl space-y-8">
        {error && (
          <Card className="w-full shadow-xl rounded-xl border-destructive bg-destructive/10">
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <AlertTriangle className="h-6 w-6 mr-2" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive-foreground">{error}</p>
              {error.includes("location") && !location && (
                 <Button onClick={() => window.location.reload()} className="mt-4">Refresh to Retry Location</Button>
              )}
            </CardContent>
          </Card>
        )}

        {isLoadingLocation && (
            <Card className="w-full shadow-xl rounded-xl">
                <CardHeader>
                <CardTitle className="flex items-center">
                    <MapPin className="h-6 w-6 mr-2 text-primary animate-pulse" />
                    Fetching Your Location...
                </CardTitle>
                </CardHeader>
                <CardContent>
                <p className="text-muted-foreground">Please allow location access for personalized weather forecasts.</p>
                </CardContent>
            </Card>
        )}

        <Card className="w-full shadow-xl rounded-xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <CardTitle className="text-2xl text-primary">Google Calendar Integration</CardTitle>
              {googleAccessToken ? (
                <Button variant="outline" onClick={handleDisconnectCalendar} disabled={isAuthLoading}>
                  {isAuthLoading ? "Processing..." : "Disconnect Google Calendar"}
                </Button>
              ) : (
                <Button onClick={handleConnectCalendar} disabled={isAuthLoading}>
                  {isAuthLoading ? "Connecting..." : "Connect Google Calendar"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {googleAccessToken 
                ? "Connected to Google Calendar. You can now add bike rides directly to your calendar from the forecast below."
                : "Connect your Google Calendar to add planned bike rides with one click."}
            </p>
          </CardContent>
        </Card>

        {isLoadingForecast && !forecastData && !error && !isLoadingLocation && (
           <Card className="w-full shadow-xl rounded-xl">
            <CardHeader>
              <CardTitle>Loading 7-Day Forecast {locationName && `for ${locationName}`}...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-60 flex items-center justify-center">
                <p className="text-muted-foreground">Fetching week's weather conditions...</p>
              </div>
            </CardContent>
           </Card>
        )}

        {!isLoadingLocation && !isLoadingForecast && forecastData && (
          <WeekForecastCard forecast={forecastData} accessToken={googleAccessToken} locationName={locationName} />
        )}

      </div>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Bike Buddy. Ride responsibly.</p>
      </footer>
    </main>
  );
}
