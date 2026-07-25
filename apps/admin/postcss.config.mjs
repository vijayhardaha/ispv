/**
 * ======================================================================
 * Postcss Configuration
 * ======================================================================
 * Purpose: Configure PostCSS plugins used to transform project styles
 *          (Tailwind, autoprefixer, etc.). Changes may require
 *          restarting the dev server.
 * Docs:    https://github.com/postcss/postcss/blob/main/docs/config.md
 * ======================================================================
 */

/** @type {import('postcss-load-config').Config} */
const config = {
  // ---- PostCSS plugins ----
  // List plugins in execution order. Tailwind should run before other
  // processors that rely on generated utilities.
  plugins: [
    // Tailwind PostCSS plugin to transform utility classes
    '@tailwindcss/postcss',

    // Optional browser prefixing plugin (enable if targeting older browsers)
    // "autoprefixer": {},
  ],
};

export default config;
