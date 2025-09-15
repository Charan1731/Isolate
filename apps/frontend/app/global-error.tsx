'use client'

import Link from "next/link"
import { useEffect, useState } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html>
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <h1 className="text-6xl font-bold text-red-600 dark:text-red-400">500</h1>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
            {mounted ? "Something went wrong on our end." : "Loading..."}
          </p>

          <div className="mt-6 space-x-4">
            <button
              onClick={() => reset()}
              className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 transition-colors inline-block"
            >
              Go Home
            </Link>
          </div>
        </main>
      </body>
    </html>
  )
}
