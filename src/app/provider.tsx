import { ChakraProvider } from "@chakra-ui/react";
import { AuthProvider } from "@/lib/auth";
import theme from "@/styles/theme";
import type { ReactNode } from "react";

type AppProviderProps = {
  children: ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>{children}</AuthProvider>
    </ChakraProvider>
  );
};
