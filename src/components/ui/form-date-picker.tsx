
import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { useFormContext, Controller } from "react-hook-form";

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
}: FormDatePickerProps) {
  const form = useFormContext();

  if (!form) {
    throw new Error("FormDatePicker must be used within a FormProvider");
  }

  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          {label && <FormLabel>{label}{required && <span className="text-destructive ml-1">*</span>}</FormLabel>}
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground",
                    buttonClassName
                  )}
                  disabled={disabled}
                >
                  {field.value ? (
                    dateUtils.formatDate(field.value)
                  ) : (
                    <span>{placeholder}</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={disabledDates}
                initialFocus
                className={cn("p-3 pointer-events-auto", className)}
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
