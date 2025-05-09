'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { addEventToCalendar } from '@/ai/flows/get-calendar-events-flow';
import type { AddCalendarEventInput } from '@/ai/schemas/calendar-event-schema';
import type { RideAnalysis } from '@/lib/ride-analyzer';
import { cn } from '@/lib/utils';

interface AddRideToCalendarDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD format
  rideAnalysis: RideAnalysis;
  accessToken: string;
}

export default function AddRideToCalendarDialog({
  isOpen,
  onClose,
  selectedDate,
  rideAnalysis,
  accessToken,
}: AddRideToCalendarDialogProps) {
  const { toast } = useToast();
  const [startTime, setStartTime] = useState('09:00'); // Default start time HH:mm
  const [durationHours, setDurationHours] = useState('1'); // Default duration in hours
  const [eventDate, setEventDate] = useState<Date | undefined>(() => parseISO(selectedDate));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setEventDate(parseISO(selectedDate));
  }, [selectedDate]);

  const handleSubmit = async () => {
    if (!eventDate) {
      toast({ title: "Error", description: "Please select a valid date.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const [hours, minutes] = startTime.split(':').map(Number);
      
      const rideStartDate = new Date(eventDate);
      rideStartDate.setHours(hours, minutes, 0, 0); // Sets local time

      const rideEndDate = new Date(rideStartDate.getTime() + Number(durationHours) * 60 * 60 * 1000);

      const eventInput: AddCalendarEventInput = {
        accessToken,
        summary: 'Bike Ride (Planned with Bike Buddy)',
        startDateTime: rideStartDate.toISOString(),
        endDateTime: rideEndDate.toISOString(),
        description: `Enjoy your bike ride! Weather conditions: ${rideAnalysis.weatherSummary}`,
      };

      const result = await addEventToCalendar(eventInput);
      toast({
        title: 'Ride Added to Calendar!',
        description: `Event "${result.event.summary}" created for ${format(rideStartDate, "MMM d, yyyy 'at' h:mm a")}.`,
      });
      onClose();
    } catch (error) {
      console.error('Failed to add event to calendar:', error);
      toast({
        title: 'Error Adding Event',
        description: 'Could not add the ride to your calendar. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Bike Ride to Calendar</DialogTitle>
          <DialogDescription>
            Schedule your bike ride for {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="event-date" className="text-right">
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] col-span-3 justify-start text-left font-normal",
                    !eventDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {eventDate ? format(eventDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={eventDate}
                  onSelect={setEventDate}
                  initialFocus
                  disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Disable past dates
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start-time" className="text-right">
              Start Time
            </Label>
            <Input
              id="start-time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right">
              Duration
            </Label>
            <Select value={durationHours} onValueChange={setDurationHours}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">30 minutes</SelectItem>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="1.5">1.5 hours</SelectItem>
                <SelectItem value="2">2 hours</SelectItem>
                <SelectItem value="2.5">2.5 hours</SelectItem>
                <SelectItem value="3">3 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add to Calendar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
