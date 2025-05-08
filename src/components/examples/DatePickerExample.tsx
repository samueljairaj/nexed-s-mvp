
import React, { useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addDays, subDays } from "date-fns";
import { dateUtils } from "@/lib/date-utils";

export function DatePickerExample() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [rangeStartDate, setRangeStartDate] = useState<Date | undefined>(undefined);
  const [rangeEndDate, setRangeEndDate] = useState<Date | undefined>(undefined);

  // Example of disabled dates (disable past dates)
  const disablePastDates = (date: Date) => {
    return dateUtils.isPast(date);
  };
  
  // Example of disabled dates (disable future dates)
  const disableFutureDates = (date: Date) => {
    return dateUtils.isFuture(date);
  };
  
  // Example of disabled dates (disable dates outside a range)
  const disableDatesOutsideRange = (date: Date) => {
    const today = new Date();
    const oneMonthFromNow = addDays(today, 30);
    return !dateUtils.isWithinRange(date, { from: today, to: oneMonthFromNow });
  };
  
  // Validate the date range
  const rangeIsValid = rangeStartDate && rangeEndDate ? 
    dateUtils.validateDateRange(rangeStartDate, rangeEndDate) : false;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Date Picker Examples</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Basic Date Picker</h3>
          <DatePicker 
            date={date}
            onDateChange={setDate}
            placeholder="Select a date"
          />
          {date && (
            <p className="text-sm mt-2">
              Selected date: {dateUtils.formatDate(date)}
            </p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Date Range Example</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs mb-1">Start Date</p>
              <DatePicker
                date={rangeStartDate}
                onDateChange={setRangeStartDate}
                placeholder="Select start date"
                disabledDates={disablePastDates}
              />
            </div>
            <div>
              <p className="text-xs mb-1">End Date</p>
              <DatePicker
                date={rangeEndDate}
                onDateChange={setRangeEndDate}
                placeholder="Select end date"
                disabledDates={date => date < (rangeStartDate || new Date())}
                disabled={!rangeStartDate}
              />
            </div>
          </div>
          {rangeStartDate && rangeEndDate && !rangeIsValid && (
            <p className="text-sm text-destructive mt-2">
              End date must be after start date
            </p>
          )}
          {rangeIsValid && (
            <p className="text-sm mt-2">
              Selected range: {dateUtils.formatDate(rangeStartDate)} to {dateUtils.formatDate(rangeEndDate)}
            </p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Date Picker with Disabled Dates</h3>
          <DatePicker 
            date={date}
            onDateChange={setDate}
            placeholder="Select a future date"
            disabledDates={disablePastDates}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Past dates are disabled
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
