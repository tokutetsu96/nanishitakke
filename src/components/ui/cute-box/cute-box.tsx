import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface CuteBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CuteBox = ({ children, className, ...props }: CuteBoxProps) => {
  return (
    <div
      className={cn(
        "border-2 border-black rounded-[20px/18px] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.75)] transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-[4px_4px_0px_0px_rgba(246,173,198,0.8)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
