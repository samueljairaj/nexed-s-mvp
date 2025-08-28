
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 pb-2 relative items-center",
        caption_label: "hidden", // Hide the default caption label as we're using our own dropdown
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 rounded-full border-0"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "w-10 font-normal text-[0.8rem] text-muted-foreground py-1.5 rounded-md",
        row: "flex w-full",
        cell: "h-10 w-10 text-center text-sm relative p-0 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 pointer-events-auto",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-muted rounded-full"
        ),
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "border border-input bg-accent/40 font-medium",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        caption_dropdowns: "flex gap-2 justify-center items-center px-10",
        dropdown: "relative inline-flex cursor-pointer rounded-md border border-input bg-background px-3 py-1 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        dropdown_month: "flex items-center gap-1 text-base mr-1 w-[5.5rem] justify-between",
        dropdown_year: "flex items-center gap-1 text-base w-[4rem] justify-between",
        dropdown_icon: "h-4 w-4 text-muted-foreground",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4 pointer-events-auto text-foreground" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4 pointer-events-auto text-foreground" />,
      }}
      captionLayout="dropdown-buttons"
      fromYear={1920}
      toYear={2050}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
