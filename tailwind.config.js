/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        borderNavy: "#111827",
        royalBlue: "#2563EB",
        memeYellow: "#FACC15",
        alertRed: "#EF4444",
        bdGreen: "#006A4E",
      },
      fontFamily: {
        bn: ['"Hind Siliguri"', '"Anek Bangla"', '"Noto Sans Bengali"', 'sans-serif'],
        arcade: ['"Press Start 2P"', 'system-ui', 'monospace'],
      },
    },
  },
  plugins: [],
};
