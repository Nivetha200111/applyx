"use client";

import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
};

const baseClasses =
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default:
    "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200",
  outline:
    "border border-gray-300 hover:bg-gray-100 text-gray-900 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800",
  ghost:
    "bg-transparent hover:bg-gray-100 text-gray-900 dark:text-gray-100 dark:hover:bg-gray-800",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function Button({
  className,
  variant = "default",
  size = "md",
  ...props
}: ButtonProps) {
  const classes = [baseClasses, variantClasses[variant], sizeClasses[size], className]
    .filter(Boolean)
    .join(" ");

  return <button className={classes} {...props} />;
}

export default Button;



