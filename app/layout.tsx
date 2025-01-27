import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "../components/ThemeProvider"
import Header from "../components/Header"
import Footer from "../components/Footer"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata = {
  title: {
    default: "Discourse Clone",
    template: "%s | Discourse Clone",
  },
  description: "A feature-rich Discourse clone built with Next.js and Supabase",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://your-discourse-clone-url.com/",
    siteName: "Discourse Clone",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}

