import type { HTMLAttributes, ReactNode } from "react";

type CardVariant = "default" | "elevated" | "muted";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  header?: ReactNode;
  footer?: ReactNode;
}

export function UiCard({
  variant = "default",
  header,
  footer,
  className = "",
  children,
  ...rest
}: CardProps) {
  const base =
    "rounded-xl border bg-white text-gray-900 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

  const variantClass: Record<CardVariant, string> = {
    default: "",
    elevated:
      "shadow-xl border-white/35 bg-white/30 dark:border-white/10 dark:bg-gray-950/50",
    muted:
      "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60",
  };

  const classes = [base, variantClass[variant], className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...rest}>
      {header ? <div className="px-4 pt-4">{header}</div> : null}
      <div className={header || footer ? "px-4 py-3" : "p-4"}>{children}</div>
      {footer ? <div className="px-4 pb-4 pt-2">{footer}</div> : null}
    </div>
  );
}

