import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ColorModeScript } from "@chakra-ui/react";
import { App } from "@/app";
import theme from "@/styles/theme";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <App />
  </StrictMode>,
);
