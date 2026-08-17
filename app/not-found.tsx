import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="text-center py-12">
      <h1 className="text-8xl font-black text-red-600 tracking-widest">404</h1>
      <h2 className="mt-4 text-2xl font-bold text-white">Page Not Found</h2>
      <p className="mt-2 text-neutral-400">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <div className="mt-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center px-4 py-2 rounded-md bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}