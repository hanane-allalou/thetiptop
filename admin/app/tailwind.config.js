/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        'custom-bg': 'hsl(var(--custom-bg))',    // Fond : #FEF7EB
        'custom-gold': 'hsl(var(--custom-gold))', // Texte :#BF8D3D #    
        'darkgreen': '#142C24',
        'backbeige':'#FEF7EB',
        
      },

      
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
       fontFamily: {
        fairplay: ['Playfair Display', 'Serif'],
      },
       
       animation: {
    'bounce-party': 'bounce-party 1.5s ease-in-out infinite',
    'pop-surprise': 'pop-surprise 0.6s ease-out',
    'fade-in-up': 'fade-in-up 0.5s ease-out both',
  },
  keyframes: {
    'bounce-party': {
      '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
      '50%': { transform: 'translateY(-6px) rotate(10deg)' },
    },
    'pop-surprise': {
      '0%': { transform: 'scale(0.5)', opacity: '0' },
      '70%': { transform: 'scale(1.1)', opacity: '1' },
      '100%': { transform: 'scale(1)', opacity: '1' },
    },
    'fade-in-up': {
      '0%': { opacity: '0', transform: 'translateY(10px)' },
      '100%': { opacity: '1', transform: 'translateY(0)' },
    },
  },
    },

    
  },
  plugins: [],

  
}
