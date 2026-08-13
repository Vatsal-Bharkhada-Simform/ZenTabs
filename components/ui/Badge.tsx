import { type HTMLAttributes } from "react";

export type BadgeVariant =
  | "default"
  | "red"
  | "blue"
  | "green"
  | "yellow";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: [
    "bg-surface-alt",
    "text-text-secondary",
    "border border-border-strong",
  ].join(" "),

  red: [
    "bg-accent-red-bg",
    "text-accent-red-text",
  ].join(" "),

  blue: [
    "bg-accent-blue-bg",
    "text-accent-blue-text",
  ].join(" "),

  green: [
    "bg-accent-green-bg",
    "text-accent-green-text",
  ].join(" "),

  yellow: [
    "bg-accent-yellow-bg",
    "text-accent-yellow-text",
  ].join(" "),
};

/**
 * Badge — pill-shaped label for tags, statuses, and counts.
 * Typography: 11px, uppercase, wide tracking.
 * Shape: fully rounded pill (border-radius: 9999px).
 */
const Badge = ({
  variant = "default",
  className = "",
  children,
  ...props
}: BadgeProps) => (
  <span
    className={[
      "inline-flex items-center",
      "rounded-full",
      "px-2.5 py-0.5",
      "text-[11px] font-medium uppercase tracking-wide",
      "select-none whitespace-nowrap",
      variantStyles[variant],
      className,
    ].join(" ")}
    {...props}
  >
    {children}
  </span>
);

export { Badge };
