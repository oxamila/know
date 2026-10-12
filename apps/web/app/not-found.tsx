import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 px-6 text-center">
      <p className="text-8xl font-extrabold text-blue-600">404</p>
      <h1 className="mt-4 text-3xl font-bold text-gray-800">Page not found</h1>
      <p className="mt-2 max-w-md text-gray-600">
        The post you are looking for does not exist (or it is still a draft).
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105"
      >
        ← Back to all posts
      </Link>
    </div>
  )
}
