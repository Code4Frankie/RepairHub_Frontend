/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // NOTE: these are placeholder tokens carried over from an interim design pass —
        // swap to Figma's actual values (https://figma.com/design/orAUZeW4pHVGIFejPLTjWP)
        // once frames/hex codes are shared. `blue` is the one real value, sampled
        // directly from the provided logo (#0061F2) so it's safe to keep as-is.
        steel: { DEFAULT: '#EEF1F5', dim: '#E3E8EE' },
        paper: '#FAFAFA',
        brand: { DEFAULT: '#0061F2', dark: '#0049B8', tint: '#E8EFFE' },
        ink: { DEFAULT: '#15233B', soft: '#20273A', mute: '#5B6472' },
        amber: { DEFAULT: '#C8762A', dim: '#EFD9B9' },
        success: { DEFAULT: '#3F7A5B', bg: '#E3EEE7' },
        alert: { DEFAULT: '#B5432E', bg: '#F5E4E0' },
        line: '#D7DCE3',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: { DEFAULT: '7px' },
    },
  },
  plugins: [],
};
