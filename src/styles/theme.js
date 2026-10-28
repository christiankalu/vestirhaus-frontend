
/**
 * Vestirhaus design system
 * Modern African luxury — editorial, warm, confident.
 *
 * Keep these tokens aligned with src/index.css.
 */

export const theme = {
  brand: {
    ivory: "#F7F0E6",
    cream: "#EDE1D0",
    terracotta: "#A94F32",
    burntSienna: "#7F3828",
    gold: "#B99756",
    ink: "#211B18",
    muted: "#766B63",
    white: "#FFFFFF",
  },

  typography: {
    heading: '"Playfair Display", Georgia, serif',
    body: '"DM Sans", Arial, sans-serif',
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  radius: {
    sm: "0.375rem",
    md: "0.625rem",
    lg: "1rem",
    xl: "1.5rem",
    full: "9999px",
  },

  spacing: {
    section: "5rem",
    sectionMobile: "3rem",
    pageGutter: "1.5rem",
    pageGutterMobile: "1rem",
    contentMax: "1440px",
  },

  motion: {
    fast: "150ms",
    normal: "250ms",
    slow: "400ms",
  },

  layout: {
    headerHeight: "76px",
    productGridGap: "1.25rem",
  },
};

export default theme;
