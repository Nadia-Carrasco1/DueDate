/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './Interfaz/templates/**/*.html',
    './Usuarios/templates/**/*.html',
    './templates/**/*.html',  
    './Interfaz/**/*.py',
    './Usuarios/**/*.py',
    './Eventos/templates/**/*.html',
    './Cronometro/templates/**/*.html',
    './Recompensas/templates/**/*.html'
  ],
  theme: {
    extend: {},
  },
  plugins: [require('tailwind-scrollbar-hide')],
}