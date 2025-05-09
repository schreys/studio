
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Script from 'next/script';
import type { Location, DailyWeather } from '@/services/weather';
import { fetchWeekForecastAction } from '@/app/actions/weather-actions'; 
import type { RideAnalysis } from '@/lib/ride-analyzer';
import { analyzeRideConditions } from '@/lib/ride-analyzer';
import WeekForecastCard from '@/components/bike-buddy/week-forecast-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, MapPin, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { googleApiConfig } from '@/lib/google-api-config';
import { useToast } from '@/hooks/use-toast';


const GOOGLE_OAUTH_TOKEN_KEY = 'google_oauth_access_token';

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
  const [isGsiScriptLoaded, setIsGsiScriptLoaded] = useState(false);
  const tokenClient = useRef<any>(null); // Stores the Google Token Client

  const { toast } = useToast();

  // Effect to load stored access token
  useEffect(() => {
    const storedToken = localStorage.getItem(GOOGLE_OAUTH_TOKEN_KEY);
    if (storedToken) {
      setGoogleAccessToken(storedToken);
      // Potentially validate token here in a real app
    }
  }, []);

  // Effect for Geolocation
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

  const initializeGoogleTokenClient = () => {
    if (!googleApiConfig.clientId) {
      console.error("Google Client ID is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your .env file.");
      setError("Google Calendar integration is not configured. Administrator: Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID.");
      setIsGsiScriptLoaded(true); // Mark as loaded to stop spinner, but with error
      return;
    }
    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: googleApiConfig.clientId,
        scope: googleApiConfig.scopes,
        callback: (tokenResponse: any) => {
          setIsAuthLoading(false);
          if (tokenResponse && tokenResponse.access_token) {
            setGoogleAccessToken(tokenResponse.access_token);
            localStorage.setItem(GOOGLE_OAUTH_TOKEN_KEY, tokenResponse.access_token);
            toast({ title: "Google Calendar Connected", description: "You can now add rides to your calendar." });
          } else {
            console.error("Google Sign-In: No access_token in response", tokenResponse);
            setError("Failed to retrieve access token from Google. Please try again.");
            toast({ title: "Connection Failed", description: "Could not get access token from Google.", variant: "destructive" });
          }
        },
        error_callback: (error: any) => {
          setIsAuthLoading(false);
          console.error("Google Sign-In error_callback:", error);
          let message = "Google Sign-In failed.";
          if (error.type === 'popup_closed_by_user') {
            message = "Sign-in process was cancelled.";
          } else if (error.type === 'popup_failed_to_open') {
            message = "Sign-in popup failed to open. Please check your browser settings.";
          } else if (error.type === 'token_request_failed') {
             message = "Token request failed. Please check your internet connection or try again later.";
          }
          setError(message);
          toast({ title: "Google Sign-In Error", description: message, variant: "destructive" });
        },
      });
      tokenClient.current = client;
    } else {
      console.error("Google Identity Services library not fully loaded.");
      setError("Google Sign-In services are not available. Please try refreshing the page.");
    }
    setIsGsiScriptLoaded(true);
  };

  const handleConnectCalendar = () => {
    if (!googleApiConfig.clientId) {
      toast({ title: "Configuration Error", description: "Google Client ID is missing. Calendar features disabled.", variant: "destructive"});
      return;
    }
    if (tokenClient.current) {
      setIsAuthLoading(true);
      tokenClient.current.requestAccessToken({ prompt: '' }); // Use 'consent' or 'select_account' if needed for specific re-auth flows
    } else {
      setError("Google Sign-In is not ready. Please wait a moment and try again.");
      toast({ title: "Initialization Error", description: "Google Sign-In is not ready. Please try again shortly.", variant: "destructive" });
    }
  };

  const handleDisconnectCalendar = () => {
    if (googleAccessToken && window.google && window.google.accounts && window.google.accounts.oauth2) {
      setIsAuthLoading(true);
      window.google.accounts.oauth2.revoke(googleAccessToken, () => {
        setGoogleAccessToken(null);
        localStorage.removeItem(GOOGLE_OAUTH_TOKEN_KEY);
        setIsAuthLoading(false);
        toast({ title: "Google Calendar Disconnected" });
      });
    } else {
      // Fallback if revoke API is not available or no token (e.g. already revoked)
      setGoogleAccessToken(null);
      localStorage.removeItem(GOOGLE_OAUTH_TOKEN_KEY);
      setIsAuthLoading(false);
    }
  };

  const isCalendarConnectDisabled = isAuthLoading || !isGsiScriptLoaded || !tokenClient.current || !googleApiConfig.clientId;


  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initializeGoogleTokenClient}
        onError={(e) => {
          console.error('Failed to load Google Identity Services script:', e);
          setError("Critical error: Google Sign-In script failed to load. Calendar features will be unavailable.");
          setIsGsiScriptLoaded(true); // Still mark as "loaded" to stop spinners, error state will handle UI
        }}
      />
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-2xl text-primary">Google Calendar Integration</CardTitle>
                {!isGsiScriptLoaded && !googleApiConfig.clientId && (
                   <div className="flex items-center text-sm text-muted-foreground">
                     <Info className="h-4 w-4 mr-2 animate-pulse" />
                     <span>Loading Google Sign-In...</span>
                   </div>
                )}
                {googleApiConfig.clientId ? (
                    googleAccessToken ? (
                    <Button variant="outline" onClick={handleDisconnectCalendar} disabled={isAuthLoading}>
                      {isAuthLoading ? "Processing..." : "Disconnect Google Calendar"}
                    </Button>
                  ) : (
                    <Button onClick={handleConnectCalendar} disabled={isCalendarConnectDisabled}>
                      {isAuthLoading ? "Connecting..." : (isGsiScriptLoaded && tokenClient.current ? "Connect Google Calendar" : "Initializing Sign-In...")}
                    </Button>
                  )
                ) : (
                  <p className="text-sm text-destructive-foreground p-2 bg-destructive/20 rounded-md">Google Client ID not configured.</p>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {googleAccessToken 
                  ? "Connected to Google Calendar. You can now add bike rides directly to your calendar from the forecast below."
                  : googleApiConfig.clientId 
                    ? "Connect your Google Calendar to add planned bike rides with one click."
                    : "Google Calendar integration is unavailable due to missing configuration."}
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
          {!googleApiConfig.clientId && <p className="text-xs mt-1">Admin: Configure NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env to enable Google Calendar.</p>}
        </footer>
      </main>
    </>
  );
}
