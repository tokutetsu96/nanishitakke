import styles from "./cute-box.module.scss";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface CuteBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CuteBox = ({ children, className, ...props }: CuteBoxProps) => {
  return (
    <div
      className={cn(styles.cuteBorder, styles.puffyHover, className)}
      {...props}
    >
      {children}
    </div>
  );
};
