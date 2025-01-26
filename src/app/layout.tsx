import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Aset Anak',
  description: 'Urus dan pantau aset anak-anak anda dengan mudah',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ms">
      <body className={inter.className}>
        <main>{children}</main>
      </body>
    </html>
  )
}