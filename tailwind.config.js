/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lightblue: "#F4FBFF",
        darkNavyBlue: "#0B132A",
        hr: "#bfbfbf",
        body: "#131823",
        txt: "#6C86AD",
        txt2: "2F8AF5",
        body2: "#06070a",
        headers: "rgba(47, 138, 245, 0.4)",
        button: "rgba(47, 138, 245, 0.16)",
        pr: "#6c86ad",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
      },

      animation: {
        wiggle: "wiggle 1s ease-in-out infinite",
        change: "change 10s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};
