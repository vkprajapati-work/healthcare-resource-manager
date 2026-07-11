import colors from 'tailwindcss/colors';

import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Bright clinical blue — the app's single accent. Change here to retheme.
        primary: colors.blue,
      },
    },
  },
  plugins: [],
} satisfies Config;
