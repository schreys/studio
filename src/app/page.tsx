'use client'; // Marking as client component for useState and useEffect

import { useState, useEffect, useCallback } from 'react';
import type { Location, Weather } from '@/services/weather';
import { getWeather } from '@/services/weather';
import type { RideAnalysis } from '@/lib/ride-analyzer';
import { analyzeRideConditions } from '@/lib/ride-analyzer';
import RideStatusCard from '@/components/bike-buddy/ride-status-card';
import CalendarEventsCard from '@/components/bike-buddy/calendar-events-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { getCalendarEvents } from '@/ai/flows/get-calendar-events-flow';
import type { UpcomingEventsOutput, CalendarEventType } from '@/ai/schemas/calendar-event-schema';
import { Button } from '@/components/ui/button';

// Mock a simple OAuth-like flow
const MOCK_ACCESS_TOKEN_KEY = 'mock_google_access_token';

export default function BikeBuddyPage() {
  const [location] = useState<Location>({ lat: 34.0522, lng: -118.2437 }); // Example: Los Angeles
  const [weather, setWeather] = useState<Weather | null>(null);
  const [analysis, setAnalysis] = useState<RideAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);

  const [calendarEvents, setCalendarEvents] = useState<CalendarEventType[]>([]);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);

  // Check for stored mock token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(MOCK_ACCESS_TOKEN_KEY);
    if (storedToken) {
      setGoogleAccessToken(storedToken);
    }
  }, []);
  

  const fetchWeatherData = useCallback(async () => {
    setIsLoadingWeather(true);
    setError(null);
    try {
      const weatherData = await getWeather(location);
      setWeather(weatherData);
      setAnalysis(analyzeRideConditions(weatherData));
    } catch (e) {
      console.error("Failed to get weather or analyze conditions:", e);
      setError("Could not fetch weather data. Please try again later.");
      setWeather(null);
      setAnalysis(null);
    } finally {
      setIsLoadingWeather(false);
    }
  }, [location]);

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  const fetchCalendarData = useCallback(async (token: string) => {
    if (!token) return;
    setIsLoadingCalendar(true);
    try {
      const result: UpcomingEventsOutput = await getCalendarEvents({ accessToken: token, maxResults: 3 });
      setCalendarEvents(result.events);
    } catch (e) {
      console.error("Failed to get calendar events:", e);
      setError(prevError => prevError ? prevError + " Also, could not fetch calendar events." : "Could not fetch calendar events.");
      setCalendarEvents([]);
    } finally {
      setIsLoadingCalendar(false);
    }
  }, []);

  // Fetch calendar data when token becomes available
  useEffect(() => {
    if (googleAccessToken) {
      fetchCalendarData(googleAccessToken);
    } else {
      // Clear events if token is removed
      setCalendarEvents([]);
    }
  }, [googleAccessToken, fetchCalendarData]);

  const handleConnectCalendar = () => {
    // Simulate OAuth flow: In a real app, this would redirect to Google's OAuth screen.
    setIsLoadingCalendar(true); // Show loading while "connecting"
    setTimeout(() => {
      const mockToken = `mock-token-${Date.now()}`;
      localStorage.setItem(MOCK_ACCESS_TOKEN_KEY, mockToken);
      setGoogleAccessToken(mockToken);
      // No need to call fetchCalendarData here, useEffect [googleAccessToken] will trigger it.
      // setIsLoadingCalendar(false); // setLoading will be handled by fetchCalendarData
    }, 1000); // Simulate network delay for auth
  };

  const handleDisconnectCalendar = () => {
    localStorage.removeItem(MOCK_ACCESS_TOKEN_KEY);
    setGoogleAccessToken(null);
    setCalendarEvents([]); // Clear events immediately
  };


  return (
    <main className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8 selection:bg-primary/20 selection:text-primary">
      <header className="my-8 text-center">
        <h1 className="text-5xl font-bold text-primary">Bike Buddy</h1>
        <p className="text-lg text-muted-foreground mt-2">Your AI companion for planning the perfect bike ride.</p>
      </header>
      
      <div className="w-full max-w-2xl space-y-8">
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
            </CardContent>
          </Card>
        )}

        {isLoadingWeather && !weather && !error && (
           <Card className="w-full shadow-xl rounded-xl">
            <CardHeader>
              <CardTitle>Loading Weather...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 flex items-center justify-center">
                <p className="text-muted-foreground">Fetching current conditions...</p>
              </div>
            </CardContent>
           </Card>
        )}

        {!isLoadingWeather && analysis && weather && (
          <RideStatusCard analysis={analysis} weather={weather} />
        )}

        <CalendarEventsCard 
          events={calendarEvents} 
          accessToken={googleAccessToken}
          onConnectCalendar={handleConnectCalendar}
          isLoading={isLoadingCalendar}
          rideAnalysis={analysis}
        />
        
        {googleAccessToken && (
          <div className="text-center">
            <Button variant="link" onClick={handleDisconnectCalendar} className="text-muted-foreground">
              Disconnect Google Calendar
            </Button>
          </div>
        )}

      </div>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Bike Buddy. Ride responsibly.</p>
      </footer>
    </main>
  );
}

