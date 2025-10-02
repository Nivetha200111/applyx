import * as React from "react";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        "rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={["p-6", className].filter(Boolean).join(" ")} {...props} />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={[
        "text-lg font-semibold leading-none tracking-tight",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={["p-6 pt-0", className].filter(Boolean).join(" ")} {...props} />
  );
}

export default Card;



