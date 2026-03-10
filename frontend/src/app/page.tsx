'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-[#0a0f1c] overflow-hidden flex flex-col relative">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-1/4 w-[1000px] h-[1000px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen mix-blend-color-dodge -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-0 -right-1/4 w-[800px] h-[800px] bg-indigo-600/30 rounded-full blur-[120px] mix-blend-screen mix-blend-color-dodge -z-10"></div>
      
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 w-full max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 tracking-tight mb-8">
          The Workspace <br/><span className="text-white">Of Tomorrow.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-400 font-medium mb-12">
          Manage your projects with a beautifully designed kanban board powered by next-gen tech. Drag, drop, and conquer.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Link href="/register" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-indigo-900 font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)]">
             Get Started Free
          </Link>
          <Link href="/login" className="w-full sm:w-auto px-8 py-4 rounded-full bg-transparent border border-gray-600 text-white font-bold text-lg hover:bg-gray-800 hover:border-gray-500 transition-all">
             Sign In To Workspace
          </Link>
        </div>
      </main>
      
      <footer className="py-8 text-center text-gray-500 text-sm">
        Built with Next.js, NestJS, and Tailwind CSS.
      </footer>
    </div>
  );
}
