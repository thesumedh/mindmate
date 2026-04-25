import type React from "react"
import type { Metadata } from "next"
import { Figtree } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import { Instrument_Serif } from "next/font/google"
import "./globals.css"

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-figtree",
  display: "swap",
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
})

export const metadata: Metadata = {
  title: "MindMate – AI Mental Health Companion",
  description:
    "Anonymous, empathetic AI mental health support. Chat, play games, and find calm — no account needed. Available 24/7.",
  keywords: ["mental health", "AI chatbot", "anxiety", "stress relief", "therapy", "wellness", "anonymous"],
  authors: [{ name: "MindMate Team" }],
  openGraph: {
    title: "MindMate – AI Mental Health Companion",
    description: "Anonymous, empathetic AI mental health support. No account needed.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${figtree.variable} ${instrumentSerif.variable} ${GeistMono.variable}`}>
      <body className={`${figtree.variable} ${instrumentSerif.variable}`}>{children}</body>
    </html>
  )
}
