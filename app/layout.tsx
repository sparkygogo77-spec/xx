import type React from "react"
import type { Metadata } from "next"
import { JetBrains_Mono, Press_Start_2P } from "next/font/google"
import "./globals.css"
import { SolanaProvider } from "@/components/solana-provider"
import { ErrorBoundary } from "@/components/error-boundary"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
})

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
})

export const metadata: Metadata = {
  title: "SOLCINERATOR",
  description: "A SolWorks project",
  icons: {
    icon: "/solworks-logo.png",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${pressStart2P.variable}`}>
      <body className="font-mono antialiased">
        <ErrorBoundary>
          <SolanaProvider>{children}</SolanaProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
