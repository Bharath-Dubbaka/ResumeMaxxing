/** @type {import('tailwindcss').Config} */
module.exports = {
   darkMode: ["class"],
   content: [
      "./pages/**/*.{js,jsx}",
      "./components/**/*.{js,jsx}",
      "./app/**/*.{js,jsx}",
      "./src/**/*.{js,jsx}",
   ],
   theme: {
      container: {
         center: true,
         padding: "2rem",
         screens: {
            "2xl": "1400px",
         },
      },
      extend: {
         colors: {
            border: "var(--border)",
            background: "var(--background)",
            foreground: "var(--foreground)",
            primary: {
               DEFAULT: "var(--primary)",
               foreground: "var(--primary-foreground)",
            },
            secondary: {
               DEFAULT: "var(--secondary)",
               foreground: "var(--secondary-foreground)",
            },
            destructive: {
               DEFAULT: "var(--destructive)",
               foreground: "var(--destructive-foreground)",
            },
            muted: {
               DEFAULT: "var(--muted)",
               foreground: "var(--muted-foreground)",
            },
            accent: {
               DEFAULT: "var(--accent)",
               foreground: "var(--accent-foreground)",
            },
         },
         animation: {
            "gradient-xy": "gradient-xy 15s ease infinite",
         },
         keyframes: {
            "accordion-down": {
               from: { height: 0 },
               to: { height: "var(--radix-accordion-content-height)" },
            },
            "accordion-up": {
               from: { height: "var(--radix-accordion-content-height)" },
               to: { height: 0 },
            },
            "gradient-xy": {
               "0%, 100%": {
                  "background-size": "400% 400%",
                  "background-position": "left center",
               },
               "50%": {
                  "background-size": "200% 200%",
                  "background-position": "right center",
               },
            },
         },
         animation: {
            "accordion-down": "accordion-down 0.2s ease-out",
            "accordion-up": "accordion-up 0.2s ease-out",
         },
      },
   },
   plugins: [require("tailwindcss-animate")],
};
