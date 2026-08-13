import { type ButtonHTMLAttributes, forwardRef } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a trailing arrow icon inside a circular well */
  withArrow?: boolean;
  /** Replaces content with a loading spinner */
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    "bg-cta-bg text-cta-text",
    "hover:bg-cta-bg-hover",
    "active:scale-[0.98]",
    "border border-transparent",
  ].join(" "),

  secondary: [
    "bg-surface text-text-primary",
    "border border-border-strong",
    "hover:bg-surface-alt",
    "active:scale-[0.98]",
  ].join(" "),

  ghost: [
    "bg-transparent text-text-secondary",
    "border border-transparent",
    "hover:bg-surface-alt hover:text-text-primary",
    "active:scale-[0.98]",
  ].join(" "),

  destructive: [
    "bg-accent-red-bg text-accent-red-text",
    "border border-transparent",
    "hover:bg-[#fcd7d9]",
    "active:scale-[0.98]",
  ].join(" "),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "text-xs px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2 gap-2",
  lg: "text-base px-5 py-2.5 gap-2.5",
};

const ArrowIcon = () => (
  <span
    aria-hidden="true"
    className={[
      "inline-flex items-center justify-center",
      "w-5 h-5 rounded-full",
      "bg-black/[0.06]",
      "transition-transform duration-[var(--duration-base)] ease-[var(--ease-spring)]",
      "group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
    ].join(" ")}
  >
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 8L8 2M8 2H3.5M8 2V6.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

const Spinner = () => (
  <svg
    className="animate-spin"
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="7"
      cy="7"
      r="6"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M7 1a6 6 0 0 1 6 6h-2a4 4 0 0 0-4-4V1z"
    />
  </svg>
);

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      withArrow = false,
      loading = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          "group",
          "inline-flex items-center justify-center",
          "font-medium rounded-sm",
          "transition-all duration-[var(--duration-base)] ease-[var(--ease-spring)]",
          "select-none whitespace-nowrap",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
          variantStyles[variant],
          sizeStyles[size],
          className,
        ].join(" ")}
        {...props}
      >
        {loading && <Spinner />}
        {children}
        {withArrow && !loading && <ArrowIcon />}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
