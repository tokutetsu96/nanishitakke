import { Box, type BoxProps } from "@chakra-ui/react";
import styles from "./cute-box.module.scss";
import type { ReactNode } from "react";

interface CuteBoxProps extends BoxProps {
  children: ReactNode;
}

export const CuteBox = ({ children, ...props }: CuteBoxProps) => {
  const classNames = `${styles.cuteBorder} ${styles.puffyHover}`;

  return (
    <Box className={classNames} {...props}>
      {children}
    </Box>
  );
};
