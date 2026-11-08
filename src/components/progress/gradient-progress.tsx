import { cn } from "@/lib/utils";

type Props = {
  /** Real completion percentage, 0–100. Never a placeholder. */
  value: number;
  label: string;
  className?: string;
  trackClassName?: string;
};

/**
 * The gradient is sized to the whole track, so it is revealed as progress grows
 * instead of being squashed into a short fill.
 */
export function GradientProgress({
  value,
  label,
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
      className={cn("h-2 overflow-hidden rounded-full bg-hover", trackClassName, className)}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-(--ease-out) motion-reduce:transition-none"
        style={{
          width: `${v}%`,
          backgroundImage: `linear-gradient(90deg, var(--progress-from), var(--progress-mid), var(--progress-to))`,
          backgroundSize: `${10000 / Math.max(v, 1)}% 100%`,
          backgroundRepeat: "no-repeat",
        }}
      />
    </div>
  );
}
