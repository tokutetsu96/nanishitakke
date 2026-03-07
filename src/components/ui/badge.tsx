import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        pink: "border-transparent bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400",
        gray: "border-transparent bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400",
        blue: "border-transparent bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
        orange: "border-transparent bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
        purple: "border-transparent bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
        green: "border-transparent bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400",
        teal: "border-transparent bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400",
        red: "border-transparent bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400",
        yellow: "border-transparent bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400",
        cyan: "border-transparent bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
