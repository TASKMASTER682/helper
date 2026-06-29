module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './componets/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-display)', 'serif'],
        sans: ['var(--font-display)', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        ink: {
          50: '#0F0C09',
          100: '#1B1510',
          200: '#2B2219',
          300: '#3E3225',
          400: '#5C4D3C',
          500: '#8E7E65',
          600: '#C4B99D',
          700: '#DED6BE',
          800: '#E9E2CF',
          900: '#F3EFE3',
          950: '#FAF7EE',
        },

        deep: {
          50: '#edf3ff',
          100: '#dde9ff',
          200: '#c2d4ff',
          300: '#9db5ff',
          400: '#758aff',
          500: '#4f5fff',
          600: '#3b3ef7',
          700: '#2e2ddc',
          800: '#2626b2',
          900: '#26278d',
          950: '#161752',
        },
        jade: {
          50: '#edfdf5',
          100: '#d3fae6',
          200: '#aaf3d0',
          300: '#72e8b6',
          400: '#38d496',
          500: '#12b97a',
          600: '#089764',
          700: '#077852',
          800: '#095f43',
          900: '#094e39',
          950: '#032b20',
        }
      },
      backgroundImage: {
        'paper': "url('/paper-texture.svg')",
        'noise': "url('/noise.svg')"
      },
      animation: {
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        glow: { '0%': { boxShadow: '0 0 5px rgba(255,124,10,0.3)' }, '100%': { boxShadow: '0 0 20px rgba(255,124,10,0.7)' } }
      },
      boxShadow: {
        'inner-lg': 'inset 0 4px 20px rgba(0,0,0,0.2)',
        'glow-pink': '0 0 20px rgba(236,72,153,0.4)',
        'glow-jade': '0 0 20px rgba(18,185,122,0.4)',
        'paper': '0 4px 30px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.2)',
      }
    },
  },
  plugins: [],
}
