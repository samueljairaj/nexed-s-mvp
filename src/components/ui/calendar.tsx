
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
        caption: "flex justify-center pt-2 relative items-center px-10 pb-2",
        caption_label: "text-base font-medium text-foreground",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-background border border-input p-0 opacity-80 hover:opacity-100 hover:bg-accent pointer-events-auto rounded-full"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-nexed-600 rounded-md w-10 font-medium text-[0.9rem] py-1.5",
        row: "flex w-full mt-1",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 pointer-events-auto",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 pointer-events-auto hover:bg-accent hover:text-accent-foreground rounded-full"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-nexed-500 text-primary-foreground hover:bg-nexed-600 hover:text-primary-foreground focus:bg-nexed-500 focus:text-primary-foreground rounded-full",
        day_today: "bg-accent text-accent-foreground border border-nexed-300 font-semibold",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        caption_dropdowns: "flex gap-1 justify-center items-center",
        dropdown: "relative inline-flex cursor-pointer rounded-md bg-background p-1 text-sm font-medium text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        dropdown_month: "flex items-center gap-1 text-base font-medium text-nexed-600",
        dropdown_year: "flex items-center gap-1 text-base font-medium text-nexed-600",
        dropdown_icon: "h-4 w-4 opacity-50",
        /* Fixing the property names to match what DayPicker expects */
        dropdown_item: "flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        dropdown_item_selected: "bg-accent text-accent-foreground",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-5 w-5 pointer-events-auto text-nexed-500" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-5 w-5 pointer-events-auto text-nexed-500" />,
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
