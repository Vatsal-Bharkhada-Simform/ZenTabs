import { type HTMLAttributes } from "react";

interface KbdProps extends HTMLAttributes<HTMLElement> {
  /** The key or key combo to display (e.g. "⌘K", "Ctrl+S", "Esc") */
  children: React.ReactNode;
}

/**
 * Kbd — renders a keyboard shortcut as a physical key.
 *
 * Uses Space Mono (--font-mono) for authentic terminal feel.
 * Styled per minimalist-ui spec:
 *   border: 1px solid #EAEAEA
 *   border-radius: 4px
 *   background: #F7F6F3
 */
const Kbd = ({ className = "", children, ...props }: KbdProps) => (
  <kbd
    className={[
      "inline-flex items-center justify-center",
      "font-mono text-xs",
      "px-1.5 py-0.5 min-w-[1.5rem]",
      "bg-surface-alt",
      "border border-border-strong",
      "rounded-sm",
      "text-text-secondary",
      // Subtle bottom shadow to simulate a physical key press depth
      "shadow-kbd",
      "select-none whitespace-nowrap",
      className,
    ].join(" ")}
    {...props}
  >
    {children}
  </kbd>
);

export { Kbd };
