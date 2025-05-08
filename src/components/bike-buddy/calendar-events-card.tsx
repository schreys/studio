'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Link as LinkIcon, PlusCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { RideAnalysis } from '@/lib/ride-analyzer';
import { addEventToCalendar } from '@/ai/flows/get-calendar-events-flow';
import type { CalendarEventType, AddCalendarEventInput } from '@/ai/schemas/calendar-event-schema';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';


interface CalendarEventsCardProps {
  events: CalendarEventType[];
  accessToken: string | null;
  onConnectCalendar: () => void;
  isLoading: boolean;
  rideAnalysis: RideAnalysis | null; 
}

export default function CalendarEventsCard({ events, accessToken, onConnectCalendar, isLoading, rideAnalysis }: CalendarEventsCardProps) {
  const { toast } = useToast();
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  const handleAddRideToCalendar = async () => {
    if (!rideAnalysis || !rideAnalysis.isGoodDay) {
      toast({
        title: "Cannot Add Ride",
        description: "No suitable ride to add to the calendar, or it's not a good day for a ride.",
        variant: "destructive",
      });
      return;
    }
    if (!accessToken) {
        toast({
            title: "Authentication Required",
            description: "Please connect to Google Calendar first.",
            variant: "destructive",
        });
        return;
    }

    setIsAddingEvent(true);
    try {
      // For simplicity, let's assume the ride is for 1 hour from now
      const now = new Date();
      const startTime = new Date(now.getTime() + 1 * 60 * 60 * 1000); // 1 hour from now
      const endTime = new Date(startTime.getTime() + 1 * 60 * 60 * 1000); // 1 hour duration

      const eventInput: AddCalendarEventInput = {
        accessToken: accessToken, 
        summary: "Bike Ride (Planned with Bike Buddy)",
        startDateTime: startTime.toISOString(),
        endDateTime: endTime.toISOString(),
        description: `Enjoy your bike ride! Weather conditions: ${rideAnalysis.weatherSummary}`,
      };
      
      const result = await addEventToCalendar(eventInput);
      toast({
        title: "Ride Added to Calendar!",
        description: `Event "${result.event.summary}" has been successfully created.`,
      });
      // Optionally, refresh calendar events list here by calling a prop function if needed
    } catch (error) {
      console.error("Failed to add event to calendar:", error);
      toast({
        title: "Error Adding Event",
        description: "Could not add the ride to your calendar. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsAddingEvent(false);
    }
  };

  return (
    <Card className="w-full shadow-xl rounded-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-primary">
            <CalendarDays className="h-6 w-6 mr-2" />
            Upcoming Events
          </CardTitle>
          {!accessToken && (
            <Button onClick={onConnectCalendar} size="sm" variant="outline" disabled={isLoading}>
              {isLoading ? "Connecting..." : "Connect Calendar"}
            </Button>
          )}
           {accessToken && rideAnalysis?.isGoodDay && (
             <Button onClick={handleAddRideToCalendar} size="sm" disabled={isAddingEvent}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {isAddingEvent ? "Adding Ride..." : "Add Ride to Calendar"}
            </Button>
           )}
        </div>
        <CardDescription>
          {accessToken ? 'Your next few Google Calendar events.' : 'Connect to see your upcoming events.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && !events.length && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-1.5 p-2 border-b border-border/50 last:border-b-0">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        )}
        {!isLoading && !accessToken && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Click "Connect Calendar" to view your Google Calendar events here.
          </p>
        )}
        {accessToken && !isLoading && events.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No upcoming events found in your calendar.
          </p>
        )}
        {accessToken && !isLoading && events.length > 0 && (
          <ul className="space-y-3">
            {events.map((event) => (
              <li key={event.id} className="pb-3 border-b border-border/50 last:border-b-0">
                <h4 className="font-semibold text-foreground">{event.summary}</h4>
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(event.start.dateTime), "EEE, MMM d, yyyy 'at' h:mm a")} - 
                  {format(parseISO(event.end.dateTime), "h:mm a")}
                </p>
                <a
                  href={event.htmlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center mt-1"
                >
                  <LinkIcon className="h-3 w-3 mr-1" /> View on Google Calendar
                </a>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

