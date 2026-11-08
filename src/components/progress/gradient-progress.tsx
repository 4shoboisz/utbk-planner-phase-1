
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  label: string;
  from?: string;
  mid?: string;
  to?: string;
  className?: string;
  trackClassName?: string;
};

export function GradientProgress({
  value,
  label,
  from = "var(--progress-from)",
  mid = "var(--progress-mid)",
  to = "var(--progress-to)",
  className,
  trackClassName,
}: Props) {
  const v = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
      className={cn(
        "h-2 overflow-hidden rounded-full bg-hover",
        trackClassName,
        className
      )}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-(--ease-out) motion-reduce:transition-none"
        style={{
          width: `${v}%`,
          backgroundImage: `linear-gradient(90deg, ${from}, ${mid}, ${to})`,
          backgroundSize: `${10000 / Math.max(v, 1)}% 100%`,
          backgroundRepeat: "no-repeat",
        }}
      />
    </div>
  );
}
