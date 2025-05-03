import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Web3Provider } from "@/context/Web3Provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "IPX - Intellectual Property Management",
  description: "Manage your intellectual property assets on the blockchain",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-qb-installed="true" >
      <body className={inter.className}>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html >
  )
}
