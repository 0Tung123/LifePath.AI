'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/utils/hooks';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Hero image */}
      <div className="w-full md:w-1/2 hidden md:block relative hero-gradient">
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white p-12">
          <h1 className="text-4xl font-display font-bold mb-6 text-center">
            Begin Your Adventure Today
          </h1>
          <p className="text-xl max-w-md text-center mb-8">
            Join our community of adventurers and explore worlds limited only by your imagination.
          </p>
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            <div className="bg-white bg-opacity-20 backdrop-blur-md p-4 rounded-lg">
              <p className="text-lg font-bold">Create Characters</p>
              <p className="text-sm">Design unique heroes with distinct abilities and backgrounds</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-md p-4 rounded-lg">
              <p className="text-lg font-bold">Dynamic Quests</p>
              <p className="text-sm">Undertake missions that evolve based on your actions</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-md p-4 rounded-lg">
              <p className="text-lg font-bold">Rich Worlds</p>
              <p className="text-sm">Explore diverse settings from fantasy to sci-fi</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-md p-4 rounded-lg">
              <p className="text-lg font-bold">AI Storytelling</p>
              <p className="text-sm">Experience narratives that adapt to your unique playstyle</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-white dark:bg-gray-900">
        <RegisterForm />
      </div>
    </div>
  );
}