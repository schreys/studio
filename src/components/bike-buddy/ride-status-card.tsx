import type { RideAnalysis } from '@/lib/ride-analyzer';
import type { Weather } from '@/services/weather';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Bike, CloudRain, Snowflake, Sun, Thermometer, Droplets, Wind as WindIcon, CloudFog, ZapOff } from 'lucide-react';

interface RideStatusCardProps {
  analysis: RideAnalysis;
  weather: Weather;
}

const getMainIcon = (analysis: RideAnalysis, weather: Weather) => {
  const iconSize = "h-16 w-16 md:h-20 md:w-20";
  if (analysis.isGoodDay) {
    return <Bike className={`${iconSize} text-accent`} />;
  }
  
  const reason = analysis.reason?.toLowerCase() ?? "";

  if (reason.includes("rain") || reason.includes("precipitation")) return <CloudRain className={`${iconSize} text-destructive`} />;
  if (reason.includes("cold") || (reason.includes("temperature") && weather.temperatureCelsius < 10)) return <Snowflake className={`${iconSize} text-primary`} />;
  if (reason.includes("hot") || (reason.includes("temperature") && weather.temperatureCelsius > 30)) return <Sun className={`${iconSize} text-destructive`} />;
  if (reason.includes("windy") || reason.includes("wind")) return <WindIcon className={`${iconSize} text-muted-foreground`} />;
  
  return <ZapOff className={`${iconSize} text-muted-foreground`} />; // Generic "not good" icon
};

export default function RideStatusCard({ analysis, weather }: RideStatusCardProps) {
  const icon = getMainIcon(analysis, weather);

  return (
    <Card className="w-full shadow-2xl rounded-xl overflow-hidden">
      <CardHeader className={`text-center p-6 ${analysis.isGoodDay ? 'bg-accent/5' : 'bg-destructive/5'}`}>
        <div className="mx-auto mb-4 transition-transform duration-300 ease-out group-hover:scale-110">{icon}</div>
        <CardTitle className={`text-2xl md:text-3xl font-bold ${analysis.isGoodDay ? 'text-accent' : 'text-destructive'}`}>
          {analysis.message}
        </CardTitle>
        {!analysis.isGoodDay && analysis.reason && (
          <CardDescription className="mt-2 text-sm text-muted-foreground px-2 md:px-4">
            {analysis.reason}
          </CardDescription>
        )}
      </CardHeader>
      
      <Separator />

      <CardContent className="p-6">
        <h3 className="text-base md:text-lg font-semibold mb-4 text-center text-foreground/80">Current Weather Conditions</h3>
        <div className="space-y-3 text-sm md:text-base">
          <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-b-0">
            <div className="flex items-center text-muted-foreground">
              <Thermometer className="h-5 w-5 mr-3 text-primary" />
              <span>Temperature</span>
            </div>
            <span className="font-medium text-foreground">{weather.temperatureCelsius}°C</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-b-0">
            <div className="flex items-center text-muted-foreground">
              <Droplets className="h-5 w-5 mr-3 text-primary" />
              <span>Precipitation</span>
            </div>
            <span className="font-medium text-foreground">{weather.precipitationMm} mm</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-b-0">
            <div className="flex items-center text-muted-foreground">
              <WindIcon className="h-5 w-5 mr-3 text-primary" />
              <span>Wind Speed</span>
            </div>
            <span className="font-medium text-foreground">{weather.windSpeedKmh} km/h</span>
          </div>
        </div>
      </CardContent>
      {analysis.isGoodDay && (
        <>
          <Separator />
          <CardFooter className="p-6 bg-accent/5">
            <p className="text-sm text-accent-foreground text-center w-full">
              Grab your helmet and enjoy the ride!
            </p>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
