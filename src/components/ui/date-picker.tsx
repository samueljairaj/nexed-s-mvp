
import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { dateUtils } from "@/lib/date-utils";

export interface DatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  disabledDates?: (date: Date) => boolean;
  className?: string;
  align?: "start" | "center" | "end";
  buttonClassName?: string;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled = false,
  disabledDates,
  className,
  align = "start",
  buttonClassName,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
            !date && "text-muted-foreground",
            buttonClassName
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
          {date ? dateUtils.formatDate(date) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 bg-popover shadow-md border border-border rounded-md" 
        align={align}
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          disabled={disabledDates}
          initialFocus
          className={cn("p-3 pointer-events-auto", className)}
        />
      </PopoverContent>
    </Popover>
  );
}
