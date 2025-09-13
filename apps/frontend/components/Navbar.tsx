import React from 'react'
import { AnimatedThemeToggler } from './magicui/animated-theme-toggler'
import { FileText, Users, DollarSign, LogIn } from 'lucide-react'

const Navbar = () => {
  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-5xl">
      <div className="bg-background/80 backdrop-blur-md border border-border/50 rounded-2xl px-6 py-3 shadow-lg shadow-black/5 dark:shadow-black/20">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight">Isolate</span>
              <span className="text-xs text-muted-foreground -mt-1">Secure Notes</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8">
            <a href="#home" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center space-x-1">
              <span>Home</span>
            </a>
            <a href="#features" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>Features</span>
            </a>
            <a href="#pricing" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center space-x-1">
              <DollarSign className="w-4 h-4" />
              <span>Pricing</span>
            </a>
            <a href="#testimonials" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Reviews
            </a>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <button className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center space-x-1">
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                Start Free
              </button>
            </div>
            <AnimatedThemeToggler className="text-xl hover:text-primary transition-colors" />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar