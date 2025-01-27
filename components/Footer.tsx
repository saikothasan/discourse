import { Github } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold text-primary mb-2">Discourse Clone</h2>
            <p className="text-sm text-muted-foreground">A feature-rich forum built with Next.js and Supabase</p>
          </div>
          <div className="flex space-x-4">
            <Link href="/about" className="text-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/privacy" className="text-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
        <div className="mt-8 flex justify-center items-center space-x-4 text-sm text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} Discourse Clone. All rights reserved.</span>
          <a
            href="https://github.com/yourusername/discourse-clone"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:text-primary transition-colors"
          >
            <Github className="h-4 w-4 mr-1" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}

