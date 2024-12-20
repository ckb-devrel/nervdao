import type { Config } from "tailwindcss";
import type { PluginAPI } from 'tailwindcss/types/config'

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/globals.css",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "btn-gradient":
          "linear-gradient(to right, rgba(0, 204, 194, 1), rgba(71, 255, 246, 1), rgba(71, 255, 246, 1), rgba(0, 204, 194, 1))",
        "btn-gradient-hover":
          "linear-gradient(to right, rgba(0, 184, 174, 1), rgba(51, 235, 226, 1), rgba(51, 235, 226, 1), rgba(0, 184, 174, 1))",
        "btn-disabled-gradient":
          "linear-gradient(to right, rgba(0, 204, 194, 1), rgba(71, 255, 246, 1), rgba(71, 255, 246, 1), rgba(0, 204, 194, 1))",
        "melt-gradient":
          "radial-gradient(49.59% 217.87% at 50.41% 100%, rgba(60, 255, 151, 1) 0%, rgba(0, 250, 237, 1) 100%)",
        "melt-gradient-hover":
          "radial-gradient(49.59% 217.87% at 50.41% 90%, rgba(60, 255, 151, 0.9) 0%,rgba(0, 250, 237, 0.9) 100%)",
        "melt-disabled-gradient":
          "radial-gradient(66.67% 205.13% at 50% 150%, #3CFF97 0%, #00FAED 100%) ",
      
      
      },
      colors: {
        white: {
          DEFAULT: "#ffffff",
          50: "#ffffff",
          100: "#fefefe",
          200: "rgba(255, 255, 255, 0.2)",
          300: "rgba(255, 255, 255, 0.3)",
          400: "rgba(255, 255, 255, 0.4)",
          500: "rgba(255, 255, 255, 0.5)",
          600: "rgba(255, 255, 255, 0.6)",
          700: "rgba(255, 255, 255, 0.7)",
          800: "rgba(255, 255, 255, 0.8)",
          900: "rgba(255, 255, 255, 0.9)",
          950: "rgba(255, 255, 255, 0.95)",
        },
        gray: {
          50: "#f7f7f7",
          100: "#e1e1e1",
          200: "#cfcfcf",
          300: "#b1b1b1",
          400: "#9e9e9e",
          500: "#7e7e7e",
          600: "#626262",
          700: "#515151",
          800: "#2d2f2f",
          900: "#232323",
          950: "#161616",
        },
        cyan: {
          50: "#f0fdfc",
          100: "#ebfffe",
          200: "#c2fffc",
          300: "#85fff9",
          400: "#47fff6",
          500: "#00faed",
          600: "#00ccc2",
          700: "#00bfb8",
          800: "#006661",
          900: "#003d3a",
          950: "#002922",
        },
        yellow: {
          50: "#fffaf8",
          100: "#fff5e1",
          200: "#ffebb3",
          300: "#ffe180",
          400: "#ffd84c",
          500: "#ffcc00",
          600: "#d6ab00",
          700: "#aa8800",
          800: "#7f6600",
          900: "#553300",
          950: "#332008",
          alpha: "rgba(255, 204, 0, 0.12)",
        },
        orange: {
          50: "#fff5e5",
          100: "#ffeac9",
          200: "#ffcc80",
          300: "#ffb347",
          400: "#ff9e1a",
          500: "#ff8a00",
          600: "#d67500",
          700: "#aa5000",
          800: "#804600",
          900: "#553000",
          950: "#331c08",
        },
        red: {
          50: "rgba(255, 240, 240, 1)",
          100: "rgba(255, 225, 225, 1)",
          200: "rgba(255, 179, 179, 1)",
          300: "rgba(255, 128, 128, 1)",
          400: "rgba(255, 76, 76, 1)",
          500: "rgba(255, 51, 29, 1)",
          600: "rgba(204, 41, 22, 1)",
          700: "rgba(170, 32, 18, 1)",
          800: "rgba(127, 22, 16, 1)",
          900: "rgba(85, 13, 10, 1)",
          950: "rgba(51, 6, 8, 1)",
        },
        green: {
          50: "#f0fff5",
          100: "#e1ffeb",
          200: "#b3ffd4",
          300: "#80ffba",
          400: "#5cff90",
          500: "#3cff97",
          600: "#2dcc66",
          700: "#22a554",
          800: "#177f3f",
          900: "#0d592b",
          950: "#08331a",
        },
        purple: {
          50: "#f3f0ff",
          100: "#e3dbff",
          200: "#c6b8ff",
          300: "#aa95ff",
          400: "#9a94ff",
          500: "#8c76ff",
          600: "#7a5bd6",
          700: "#5f45aa",
          800: "#46337f",
          900: "#2e2155",
          950: "#1c1433",
        },
      },
      fontFamily: {
        "work-sans": ["var(--font-work-sans)", "sans-serif"],
        play: ["var(--font-play)", "sans-serif"],
      },
      fontSize: {
        description: [
          "18px",
          {
            lineHeight: "170%",
            fontWeight: "400", // Roman 通常对应 400 字重
          },
        ],
        "body-1": [
          "16px",
          {
            lineHeight: "170%",
            fontWeight: "400",
          },
        ],
        "body-2": [
          "14px",
          {
            lineHeight: "170%",
            fontWeight: "400",
          },
        ],
        footnote: [
          "12px",
          {
            lineHeight: "120%",
            fontWeight: "400",
          },
        ],
        button: [
          "16px",
          {
            lineHeight: "100%",
            fontWeight: "500", // Medium 通常对应 500 字重
          },
        ],
        // 添加heading样式
        h1: [
          "48px",
          {
            lineHeight: "120%",
            fontWeight: "400",
          },
        ],
        h2: [
          "40px",
          {
            lineHeight: "120%",
            fontWeight: "400",
          },
        ],
        h3: [
          "32px",
          {
            lineHeight: "120%",
            fontWeight: "400",
          },
        ],
        h4: [
          "28px",
          {
            lineHeight: "120%",
            fontWeight: "400",
          },
        ],
        h5: [
          "24px",
          {
            lineHeight: "120%",
            fontWeight: "400",
          },
        ],
        h6: [
          "20px",
          {
            lineHeight: "120%",
            fontWeight: "400",
          },
        ],
      },
    },
  },
  safelist: [
    "bg-emerald-900",
    "bg-purple-900",
    "bg-cyan-900",
    "bg-emerald-400",
    "bg-purple-400",
    "bg-cyan-400",
    "text-emerald-400",
    "text-purple-400",
    "text-cyan-400",
  ],
  plugins: [
    function ({ addUtilities }: PluginAPI) {
      addUtilities({
        //@ts-expect-error tailwind type
        '.no-arrows': {
          /* Styles to remove arrows in various browsers */
          '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
            '-webkit-appearance': 'none',
            margin: 0,
          },
          '&::-moz-focus-inner': {
            border: 0,
          },
        },
      });
    },
  ],
};
export default config;
