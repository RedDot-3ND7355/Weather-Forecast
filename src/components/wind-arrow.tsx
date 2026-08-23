import { cn } from "@/lib/utils";

export function WindArrow({
  deg,
  className,
  wet = false,
}: {
  deg: number;
  className?: string;
  wet?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn("size-4 shrink-0", wet ? "text-rain" : "text-muted", className)}
      aria-hidden="true"
      style={{ transform: `rotate(${deg}deg)` }}
    >
      <path
        d="M8 1.5 L10.2 8.2 L8 7.1 L5.8 8.2 Z"
        fill="currentColor"
      />
      <path
        d="M8 14.5 L9.2 8.4 L8 9.2 L6.8 8.4 Z"
        fill="currentColor"
        opacity="0.55"
      />
    </svg>
  );
}
