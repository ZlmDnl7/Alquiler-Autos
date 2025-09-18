
const tailwindConfig = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'hero-pattern':
          "url('./src/pages/admin/data/welcome-bg.svg')",
      }
    },
  },
  plugins: [
  ],
};



export default tailwindConfig;
