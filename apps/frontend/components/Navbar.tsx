'use client';
import React from 'react'
import { AnimatedThemeToggler } from './magicui/animated-theme-toggler'
import { FileText, Users, DollarSign, LogIn, LogOut, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();

  const router = useRouter();

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-5xl">
      <div className="bg-background/80 backdrop-blur-md border-2 border-border/60 rounded-2xl px-6 py-3 shadow-lg shadow-black/5 dark:shadow-black/20 ring-1 ring-primary/10">
        <div className="flex justify-between items-center cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <Link href="/" className="flex flex-col cursor-pointer">
              <span className="text-xl font-bold tracking-tight">Isolate</span>
              <span className="text-xs text-muted-foreground -mt-1">Secure Notes</span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center space-x-8 cursor-pointer">
            <Link href="/" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center space-x-1 cursor-pointer">
              <span>Home</span>
            </Link>
            <Link href="/features" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center space-x-1 cursor-pointer">
              <Users className="w-4 h-4" />
              <span>Features</span>
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center space-x-1 cursor-pointer">
              <DollarSign className="w-4 h-4" />
              <span>Pricing</span>
            </Link>
            <Link href="/testimonials" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center space-x-1 cursor-pointer">
              Reviews
            </Link>
            {isAuthenticated && user?.role === 'ADMIN' && (
              <Link href="/admin" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center space-x-1 cursor-pointer">
                <span>Admin</span>
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2 text-sm font-medium text-foreground/80">
                    <User className="w-4 h-4" />
                    <span>{user?.email}</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {user?.role}
                    </span>
                  </div>
                  <button 
                    onClick={logout}
                    className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => router.push('/auth')} className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center space-x-1 cursor-pointer">
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </button>
                  <button onClick={() => router.push('/auth')} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer">
                    Start Free
                  </button>
                </>
              )}
            </div>
            <AnimatedThemeToggler className="text-xl hover:text-primary transition-colors cursor-pointer" />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar