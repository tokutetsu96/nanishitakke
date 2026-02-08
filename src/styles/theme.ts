import { extendTheme } from "@chakra-ui/react";
import type { StyleFunctionProps } from "@chakra-ui/theme-tools";

const theme = extendTheme({
  config: {
    initialColorMode: "system",
    useSystemColorMode: true,
  },
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        fontFamily: "'M PLUS Rounded 1c', sans-serif",
        backgroundColor: props.colorMode === "dark" ? "gray.900" : "gray.50",
        color: props.colorMode === "dark" ? "white" : "gray.800",
      },
    }),
  },

  colors: {
    brand: {
      base: "gray.50",
      primary: "pink.100",
      secondary: "blue.50",
      accent: "orange.100",
    },
    pink: {
      300: "#FBB6CE",
    },
  },

  fonts: {
    heading: "'M PLUS Rounded 1c', sans-serif",
    body: "'M PLUS Rounded 1c', sans-serif",
  },

  radii: {
    none: "0",
    sm: "0.125rem",
    base: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1.25rem",
    "3xl": "1.875rem",
    full: "9999px",
  },

  components: {
    Button: {
      baseStyle: {
        borderRadius: "2xl",
      },
      variants: {
        solid: (props: StyleFunctionProps) => ({
          color: props.colorMode === "dark" ? "gray.800" : undefined,
        }),
      },
    },
    Box: {
      baseStyle: {
        borderRadius: "2xl",
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          borderRadius: "2xl",
        },
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: "pink.300",
      },
    },
    Card: {
      baseStyle: (props: StyleFunctionProps) => ({
        container: {
          bg: props.colorMode === "dark" ? "gray.800" : "white",
        },
      }),
    },
    Menu: {
      baseStyle: (props: StyleFunctionProps) => ({
        list: {
          bg: props.colorMode === "dark" ? "gray.800" : "white",
        },
        item: {
          bg: props.colorMode === "dark" ? "gray.800" : "white",
          _hover: {
            bg: props.colorMode === "dark" ? "gray.700" : "gray.100",
          },
        },
      }),
    },
  },
});

export default theme;
