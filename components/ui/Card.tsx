import { type HTMLAttributes } from "react";

export type CardVariant = "default" | "flat" | "elevated";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  /**
   * When true, renders the Double-Bezel structure:
   * outer shell (surface-alt bg + border) wraps inner core (surface bg).
   * When false, renders a single flat container.
   */
  bezel?: boolean;
  /** Content placed inside the inner bezel core */
  children: React.ReactNode;
}

/**
 * Card — the primary container primitive.
 *
 * Default (bezel=true):
 *   Outer shell: surface-alt bg, 1px border-strong, bezel-outer radius, 6px padding
 *   Inner core:  surface bg, bezel-inner radius, inset highlight shadow
 *
 * Flat (bezel=false):
 *   Single div with border and radius — for dense layouts where nesting is excessive.
 */
const Card = ({
  variant = "default",
  bezel = true,
  className = "",
  children,
  ...props
}: CardProps) => {
  if (bezel) {
    return (
      <div
        className={[
          "bezel-outer",
          "transition-shadow duration-[var(--duration-base)] ease-[var(--ease-spring)]",
          variant === "elevated" &&
            "hover:shadow-card-hover hover:-translate-y-px",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        <div className="bezel-inner h-full">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={[
        "bg-surface",
        "border border-border-strong",
        "rounded-lg",
        variant === "elevated" &&
          "hover:shadow-card-hover hover:-translate-y-px",
        "transition-all duration-[var(--duration-base)] ease-[var(--ease-spring)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * CardHeader — standard top section with padding.
 */
const CardHeader = ({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={["px-5 pt-5 pb-3", className].join(" ")}
    {...props}
  >
    {children}
  </div>
);

/**
 * CardBody — main content area with padding.
 */
const CardBody = ({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={["px-5 py-4", className].join(" ")}
    {...props}
  >
    {children}
  </div>
);

/**
 * CardFooter — bottom section, typically for actions.
 */
const CardFooter = ({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={[
      "px-5 pt-3 pb-5",
      "border-t border-border",
      "flex items-center gap-2",
      className,
    ].join(" ")}
    {...props}
  >
    {children}
  </div>
);

export { Card, CardHeader, CardBody, CardFooter };
