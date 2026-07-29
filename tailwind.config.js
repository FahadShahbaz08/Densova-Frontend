/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{js,jsx}', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream:         '#FAF6EC',
        'cream-2':     '#F3EBDA',
        beige:         '#EDE1CC',
        'beige-2':     '#DDD0B4',
        sand:          '#C9B796',
        moss:          '#5C6B3F',
        forest:        '#2E3A1F',
        'forest-2':    '#3B4A28',
        'forest-deep': '#1F2814',
        'olive-soft':  '#8AA17A',
        gold:          '#C9A24E',
        'gold-2':      '#E8CB8A',
        'gold-deep':   '#8A6526',
        'rose-gold':   '#D9AE7E',
        ink:           '#1B1A15',
        'ink-2':       '#34322B',
        muted:         '#6E6A5D',
      },
      fontFamily: {
        display: ['Fraunces', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans:    ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '10px',
        lg: '18px',
      },
      boxShadow: {
        'soft-sm': '0 4px 16px -8px rgba(31,40,20,0.20)',
        'soft-md': '0 18px 50px -28px rgba(31,40,20,0.35)',
        'soft-lg': '0 40px 80px -40px rgba(31,40,20,0.45)',
      },
      transitionTimingFunction: {
        'botanical':     'cubic-bezier(.22,.61,.36,1)',
        'botanical-out': 'cubic-bezier(.16,1,.3,1)',
      },
      backgroundImage: {
        'gold-grad': 'linear-gradient(135deg, #B68A3E 0%, #E8CB8A 35%, #9D6E26 65%, #E8CB8A 100%)',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 6s linear infinite',
        marquee: 'marquee 32s linear infinite',
        'fade-up': 'fadeUp .8s cubic-bezier(.16,1,.3,1) forwards',
      },
    },
  },
  plugins: [],
}
