import { type Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        mandiri: {
          blue: {
            light: '#0077c8',
            DEFAULT: '#005b9f',
            dark: '#00447c',
          },
          gold: '#cda434',
        },
      },
    },
  },
  plugins: [],
}

export default config
