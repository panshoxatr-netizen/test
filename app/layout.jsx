import { Inter, Quicksand } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const quicksand = Quicksand({ 
  subsets: ['latin'],
  variable: '--font-quicksand',
  display: 'swap'
})

export const metadata = {
  title: 'Diagrama NS - Prueba de Escritorio',
  description: 'Herramienta para crear diagramas de bloque NS y realizar pruebas de escritorio',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} ${quicksand.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
