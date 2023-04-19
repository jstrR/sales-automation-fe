const { fontFamily } = require('tailwindcss/defaultTheme')
const config = require('./tailwind.theme.config')

const themeConfig = process.env.THEME_KEY && config[process.env.THEME_KEY] ? config[process.env.THEME_KEY] : config.default
const { colors } = themeConfig

module.exports = {
  content: [
    './public/**/*.html',
    './src/**/*.{astro,js,ts,tsx}'
  ],
  theme: {
    fontFamily: {
      sans: ["Fira Code", ...fontFamily.sans],
    },
    extend: {
      colors: {
        theme: {
          ...colors,
        },
      },
      typography: (theme) => ({
        dark: {
          css: {
            color: theme("colors.gray.200"),
          },
        },
        DEFAULT: {
          css: {
            a: {
              color: colors.dark.primary,
              "&:hover": {
                color: colors.primary,
              },
            },
            blockquote: {
              color: colors.primary,
              borderColor: colors.dark.primary,
            },
            "blockquote > p::before, p::after": {
              color: colors.dark.primary,
            },
            h1: {
              color: colors.dark.secondary,
            },
            h2: {
              color: colors.dark.secondary,
            },
            h3: {
              color: colors.dark.secondary,
            },
          },
        },
      }),
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
