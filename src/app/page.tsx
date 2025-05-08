import { getWeather, type Location, type Weather } from '@/services/weather';
import { analyzeRideConditions, type RideAnalysis } from '@/lib/ride-analyzer';
import RideStatusCard from '@/components/bike-buddy/ride-status-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default async function BikeBuddyPage() {
  const location: Location = { lat: 34.0522, lng: -118.2437 }; // Example: Los Angeles

  let weather: Weather | null = null;
  let analysis: RideAnalysis | null = null;
  let error: string | null = null;

  try {
    weather = await getWeather(location);
    analysis = analyzeRideConditions(weather);
  } catch (e) {
    console.error("Failed to get weather or analyze conditions:", e);
    error = "Could not fetch weather data at this time. Please try again later.";
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8 selection:bg-primary/20 selection:text-primary">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-bold text-primary">Bike Buddy</h1>
        <p className="text-lg text-muted-foreground mt-2">Is today a good day for a ride?</p>
      </header>
      
      <div className="w-full max-w-md">
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
        {!error && analysis && weather && (
          <RideStatusCard analysis={analysis} weather={weather} />
        )}
      </div>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Bike Buddy. Ride responsibly.</p>
      </footer>
    </main>
  );
}
