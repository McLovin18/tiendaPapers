/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Paleta personalizada de cosméticos
        cosmetic: {
          primary: '#8C9C84',      // Verde olivo elegante - botones
          secondary: '#F4F0E8',    // Beige crema - backgrounds
          tertiary: '#3A3029',     // Marrón oscuro - textos principales
          accent: '#D28A6D',       // Coral cálido - atención especial
          // Variaciones para hover y estados
          'primary-dark': '#7A8A72',
          'primary-light': '#9CAB94',
          'secondary-dark': '#EAE6DE',
          'tertiary-light': '#5A4F46',
          'accent-dark': '#C4795C',
          'accent-light': '#E099A4'
        },
      },
    },
  },
  plugins: [],
}
