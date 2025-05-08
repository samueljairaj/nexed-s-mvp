
import { format } from "date-fns";

export const formatActivityDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return "Today, " + format(date, "h:mm a");
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday, " + format(date, "h:mm a");
    } else {
      return format(date, "MMM d, yyyy");
    }
  } catch (e) {
    return "Recent";
  }
};
