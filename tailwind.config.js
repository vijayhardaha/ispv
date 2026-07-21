/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Indian flag palette
        saffron: {
          DEFAULT: "#FF9933",
          50: "#FFF4E5",
          100: "#FFE4BF",
          200: "#FFCE8A",
          300: "#FFB85A",
          400: "#FFA53F",
          500: "#FF9933",
          600: "#E6811F",
          700: "#B56614",
          800: "#7E4709",
          900: "#3D2200"
        },
        indiaGreen: {
          DEFAULT: "#138808",
          50: "#E1F4E0",
          100: "#B5E2B2",
          200: "#80CB7B",
          300: "#4DB449",
          400: "#2AA025",
          500: "#138808",
          600: "#0E6E06",
          700: "#0A5405",
          800: "#063A03",
          900: "#022001"
        },
        navy: {
          DEFAULT: "#000080",
          50: "#E5E5F2",
          100: "#BFBFDC",
          200: "#9999C5",
          300: "#7373AF",
          400: "#4D4D99",
          500: "#000080",
          600: "#00006B",
          700: "#000054",
          800: "#00003D",
          900: "#000026"
        },
        ink: "#0A0A0A",
        paper: "#FFFBF0",
        // accents
        lime: "#D7F252",
        hotpink: "#FF3D8B",
        sky: "#5BC0EB",
        sun: "#FFD23F"
      },
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"]
      },
      boxShadow: {
        brutal: "4px 4px 0 0 #0A0A0A",
        "brutal-sm": "2px 2px 0 0 #0A0A0A",
        "brutal-lg": "6px 6px 0 0 #0A0A0A",
        "brutal-xl": "8px 8px 0 0 #0A0A0A",
        "brutal-saffron": "4px 4px 0 0 #FF9933",
        "brutal-green": "4px 4px 0 0 #138808",
        "brutal-navy": "4px 4px 0 0 #000080",
        "brutal-pink": "4px 4px 0 0 #FF3D8B",
        "brutal-lime": "4px 4px 0 0 #D7F252",
        "brutal-sun": "4px 4px 0 0 #FFD23F",
        "brutal-press": "0 0 0 0 #0A0A0A",
        "brutal-white": "4px 4px 0 0 #FFFFFF"
      },
      borderWidth: { 3: "3px", 5: "5px" },
      borderRadius: { brutal: "0px", sm: "2px", md: "4px" },
      keyframes: {
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        wiggle: { "0%, 100%": { transform: "rotate(-2deg)" }, "50%": { transform: "rotate(2deg)" } },
        float: { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        slideUp: { "0%": { transform: "translateY(100%)" }, "100%": { transform: "translateY(0)" } },
        snapIn: { "0%": { transform: "scale(0.92)", opacity: "0" }, "100%": { transform: "scale(1)", opacity: "1" } },
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 rgba(19,136,8,0.5)" },
          "100%": { boxShadow: "0 0 0 14px rgba(19,136,8,0)" }
        }
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        wiggle: "wiggle 0.4s ease-in-out",
        float: "float 3s ease-in-out infinite",
        slideUp: "slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        snapIn: "snapIn 0.25s ease-out",
        pulseRing: "pulseRing 1.5s ease-out infinite"
      }
    }
  },
  plugins: []
};
