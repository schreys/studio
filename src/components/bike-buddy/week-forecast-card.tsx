'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarPlus, Sun, CloudRain, Snowflake, Wind as WindIcon, Thermometer, Droplets, HelpCircle, CheckCircle2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { ForecastItem } from '@/app/page';
import AddRideToCalendarDialog from './add-ride-to-calendar-dialog';

interface WeekForecastCardProps {
  forecast: ForecastItem[];
  accessToken: string | null;
}

const getWeatherIcon = (analysis: ForecastItem['analysis'], weather: ForecastItem) => {
  const iconSize = "h-8 w-8";
  if (analysis.isGoodDay) {
    return <Sun className={`${iconSize} text-yellow-500`} />;
  }
  const reason = analysis.reason?.toLowerCase() ?? "";
  if (reason.includes("rain") || reason.includes("precipitation")) return <CloudRain className={`${iconSize} text-blue-400`} />;
  if (reason.includes("cold") || (weather.temperatureCelsius < 10 && reason.includes("temperature"))) return <Snowflake className={`${iconSize} text-sky-300`} />;
  if (reason.includes("hot") || (weather.temperatureCelsius > 30 && reason.includes("temperature"))) return <Sun className={`${iconSize} text-orange-500`} />;
  if (reason.includes("windy") || reason.includes("wind")) return <WindIcon className={`${iconSize} text-gray-400`} />;
  return <HelpCircle className={`${iconSize} text-muted-foreground`} />;
};

export default function WeekForecastCard({ forecast, accessToken }: WeekForecastCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState<ForecastItem | null>(null);

  const handleOpenDialog = (dayData: ForecastItem) => {
    setSelectedDayData(dayData);
    setDialogOpen(true);
  };

  return (
    <Card className="w-full shadow-xl rounded-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-primary">7-Day Bike Ride Forecast</CardTitle>
        <CardDescription>Plan your rides for the week ahead. Connect Google Calendar to add events.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {forecast.map((day) => (
          <Card key={day.date} className={`rounded-lg overflow-hidden shadow-md transition-all hover:shadow-lg ${day.analysis.isGoodDay ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700' : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700'}`}>
            <CardHeader className="p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-3">
                   {getWeatherIcon(day.analysis, day)}
                  <div>
                    <CardTitle className="text-xl font-semibold">
                      {format(parseISO(day.date), "EEEE, MMM d")}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {day.analysis.isGoodDay ? 
                        <span className="text-green-600 dark:text-green-400 font-medium flex items-center"><CheckCircle2 className="h-4 w-4 mr-1"/>{day.analysis.message}</span> : 
                        <span className="text-red-600 dark:text-red-400 font-medium">{day.analysis.message}</span>}
                    </CardDescription>
                  </div>
                </div>
                {day.analysis.isGoodDay && accessToken && (
                  <Button size="sm" onClick={() => handleOpenDialog(day)} className="mt-2 sm:mt-0">
                    <CalendarPlus className="mr-2 h-4 w-4" /> Add to Calendar
                  </Button>
                )}
                 {day.analysis.isGoodDay && !accessToken && (
                  <p className="text-xs text-muted-foreground mt-2 sm:mt-0 text-right">Connect Calendar to add this ride.</p>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 border-t border-border/30">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center">
                  <Thermometer className="h-5 w-5 mr-2 text-primary" />
                  <span>Temp: {day.temperatureCelsius}°C</span>
                </div>
                <div className="flex items-center">
                  <Droplets className="h-5 w-5 mr-2 text-primary" />
                  <span>Precip: {day.precipitationMm} mm</span>
                </div>
                <div className="flex items-center">
                  <WindIcon className="h-5 w-5 mr-2 text-primary" />
                  <span>Wind: {day.windSpeedKmh} km/h</span>
                </div>
              </div>
              {!day.analysis.isGoodDay && day.analysis.reason && (
                <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/20">{day.analysis.reason}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </CardContent>
      {selectedDayData && accessToken && (
        <AddRideToCalendarDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          selectedDate={selectedDayData.date}
          rideAnalysis={selectedDayData.analysis}
          accessToken={accessToken}
        />
      )}
    </Card>
  );
}