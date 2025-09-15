// app/404.tsx or pages/404.tsx (depending on your Next.js setup)

"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export default function NotFoundPage() {
  // Optional: Handle client-only stuff safely
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-100">404</h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
        {mounted ? "Oops! Page not found." : "Loading..."}
      </p>

      <Link
        href="/"
        className="mt-6 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 transition-colors"
      >
        Go Home
      </Link>
    </main>
  )
}
