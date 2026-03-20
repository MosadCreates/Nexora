import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-6">
      <div className="max-w-md mx-auto text-center">
        <div className="text-8xl font-bold text-neutral-200 dark:text-neutral-800 mb-4">404</div>
        <h1 className="text-2xl font-bold text-black dark:text-white mb-3">Page not found</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8 text-sm leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium text-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/analysis"
            className="px-6 py-3 border border-neutral-200 dark:border-neutral-800 text-black dark:text-white rounded-lg font-medium text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
