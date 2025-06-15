
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ message = "Loading...", size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-3">
      <Loader2 className={`animate-spin text-nexed-500 ${sizeClasses[size]}`} />
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  );
}
