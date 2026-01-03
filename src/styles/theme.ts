import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      body: {
        fontFamily: "'M PLUS Rounded 1c', sans-serif",
        backgroundColor: "gray.50",
      },
    },
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
  },
});

export default theme;
