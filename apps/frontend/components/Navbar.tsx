import React from 'react'
import { AnimatedThemeToggler } from './magicui/animated-theme-toggler'

const Navbar = () => {
  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-4xl">
      <div className="bg-background/80 backdrop-blur-md border border-border/50 rounded-2xl px-6 py-3 shadow-lg shadow-black/5 dark:shadow-black/20">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-primary-foreground rounded-sm"></div>
            </div>
            <span className="text-xl font-semibold tracking-tight">Isolate</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Home
            </a>
            <a href="#features" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#about" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              About
            </a>
            <a href="#contact" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Contact
            </a>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center space-x-4">
            <AnimatedThemeToggler className="text-xl hover:text-primary transition-colors" />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar