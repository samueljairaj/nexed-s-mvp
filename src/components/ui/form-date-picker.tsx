
import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { dateUtils } from "@/lib/date-utils";

export interface FormDatePickerProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  disabledDates?: (date: Date) => boolean;
  className?: string;
  buttonClassName?: string;
  required?: boolean;
  control?: any; // Allow control prop for compatibility
}

export function FormDatePicker({
  name,
  label,
  placeholder = "Pick a date",
  disabled = false,
  disabledDates,
  className,
  buttonClassName,
  required = false,
  control // Accept control prop but don't use it directly
}: FormDatePickerProps) {
  const form = useFormContext();

  if (!form) {
    throw new Error("FormDatePicker must be used within a FormProvider");
  }

  const value = form.getValues(name);
  const date = value ? new Date(value) : undefined;
  
  const handleSelect = (selectedDate: Date | undefined) => {
    form.setValue(name, selectedDate, { shouldValidate: true });
  };

  return (
    <FormItem className="flex flex-col">
      {label && <FormLabel>{label}{required && <span className="text-destructive ml-1">*</span>}</FormLabel>}
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant={"outline"}
              className={cn(
                "w-full pl-3 text-left font-normal border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
                !date && "text-muted-foreground",
                buttonClassName
              )}
              disabled={disabled}
            >
              {date ? (
                dateUtils.formatDate(date)
              ) : (
                <span>{placeholder}</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-70" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-popover shadow-md border border-border rounded-md" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            disabled={disabledDates}
            initialFocus
            className={cn("p-3 pointer-events-auto", className)}
          />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
}
