
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
    <Card className="w-full max-w-md mx-auto shadow-sm border">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Date Selection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">Single Date</h3>
          <DatePicker 
            date={date}
            onDateChange={setDate}
            placeholder="Select a date"
            buttonClassName="bg-background"
          />
          {date && (
            <p className="text-sm mt-2 text-muted-foreground">
              Selected: {dateUtils.formatShort(date)}
            </p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">Date Range</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs mb-1 text-muted-foreground">Start</p>
              <DatePicker
                date={rangeStartDate}
                onDateChange={setRangeStartDate}
                placeholder="Start date"
                disabledDates={disablePastDates}
                buttonClassName="bg-background"
              />
            </div>
            <div>
              <p className="text-xs mb-1 text-muted-foreground">End</p>
              <DatePicker
                date={rangeEndDate}
                onDateChange={setRangeEndDate}
                placeholder="End date"
                disabledDates={date => date < (rangeStartDate || new Date())}
                disabled={!rangeStartDate}
                buttonClassName="bg-background"
              />
            </div>
          </div>
          {rangeStartDate && rangeEndDate && !rangeIsValid && (
            <p className="text-sm text-destructive mt-2">
              End date must be after start date
            </p>
          )}
          {rangeIsValid && (
            <p className="text-sm mt-2 text-muted-foreground">
              Range: {dateUtils.formatShort(rangeStartDate)} to {dateUtils.formatShort(rangeEndDate)}
            </p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">With Constraints</h3>
          <DatePicker 
            date={date}
            onDateChange={setDate}
            placeholder="Select within next 30 days"
            disabledDates={disableDatesOutsideRange}
            buttonClassName="bg-background"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Only dates within the next 30 days are enabled
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
