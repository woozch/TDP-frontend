import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "outline" | "ghost" | "danger";
type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function UiButton({
  variant = "outline",
  size = "md",
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  const variantClass: Record<ButtonVariant, string> = {
    primary:
      "bg-brand text-white hover:bg-brand-hover dark:bg-brand dark:text-white dark:hover:bg-brand-hover",
    outline:
      "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
    ghost:
      "text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100",
    danger:
      "bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800",
  };

  const sizeClass: Record<ButtonSize, string> = {
    xs: "px-2 py-1 text-xs",
    sm: "px-2.5 py-1.5 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-2.5 text-sm",
  };

  const widthClass = fullWidth ? "w-full" : "";

  const classes = [
    base,
    variantClass[variant],
    sizeClass[size],
    widthClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} disabled={disabled} {...rest}>
      {leftIcon ? <span className="mr-2 inline-flex items-center">{leftIcon}</span> : null}
      <span>{children}</span>
      {rightIcon ? (
        <span className="ml-2 inline-flex items-center">{rightIcon}</span>
      ) : null}
    </button>
  );
}

