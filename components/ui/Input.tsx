import { type InputHTMLAttributes, forwardRef, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Shown below the input in the error accent color */
  error?: string;
  /** Helper text shown below the input when there's no error */
  hint?: string;
  /** Optional icon shown on the left side of the input */
  leadingIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leadingIcon,
      id: externalId,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = externalId ?? generatedId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const hasDescription = !!(error || hint);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={id}
            className={[
              "text-sm font-medium",
              "text-text-primary",
              disabled && "opacity-40",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leadingIcon && (
            <span
              aria-hidden="true"
              className="absolute left-3 text-text-muted pointer-events-none flex items-center"
            >
              {leadingIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              hasDescription
                ? [error ? errorId : null, hint ? hintId : null]
                    .filter(Boolean)
                    .join(" ")
                : undefined
            }
            className={[
              "w-full",
              "bg-surface",
              "border border-border-strong",
              "rounded-md",
              "text-sm text-text-primary",
              "placeholder:text-text-placeholder",
              "transition-all duration-[var(--duration-fast)] ease-[var(--ease-spring)]",
              // Padding accounts for leading icon
              leadingIcon ? "pl-9 pr-3 py-2.5" : "px-3 py-2.5",
              // Focus ring — uses border-focus token
              "focus:outline-none focus:border-border-focus",
              "focus:ring-2 focus:ring-border-focus focus:ring-opacity-10",
              // Error state
              error
                ? "border-accent-red-text focus:border-accent-red-text focus:ring-accent-red-text"
                : "",
              // Disabled state
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-surface-alt",
              className,
            ].join(" ")}
            {...props}
          />
        </div>

        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-xs text-accent-red-text mt-0.5"
          >
            {error}
          </p>
        )}

        {hint && !error && (
          <p
            id={hintId}
            className="text-xs text-text-muted mt-0.5"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
