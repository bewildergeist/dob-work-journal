import colors from "tailwindcss/colors";
import defaultTheme from "tailwindcss/defaultTheme";
import tailwindForms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        gray: colors.zinc,
      },
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [tailwindForms],
};
