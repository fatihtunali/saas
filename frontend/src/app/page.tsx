import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Tour Operations SaaS
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Complete tour operations management system with 300+ API endpoints
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" className="bg-primary-500 hover:bg-primary-600">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline">
              Register
            </Button>
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-primary-600">
              Complete API Integration
            </h3>
            <p className="text-gray-600">
              Pre-configured with axios client, interceptors, and token management
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-success-600">
              Modern Tech Stack
            </h3>
            <p className="text-gray-600">
              Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui components
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-warning-600">
              Production Ready
            </h3>
            <p className="text-gray-600">
              Zustand state management, React Query, and form validation with Zod
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
