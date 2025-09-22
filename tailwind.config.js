/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // escanea todos los archivos en la carpeta app
    "./pages/**/*.{js,ts,jsx,tsx}", // si usas páginas
    "./components/**/*.{js,ts,jsx,tsx}" // si usas componentes fuera de app
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}




