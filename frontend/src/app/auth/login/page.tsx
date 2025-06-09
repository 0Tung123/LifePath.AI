'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/utils/hooks';
import LoginForm from '@/components/auth/LoginForm';
import Image from 'next/image';

export default function LoginPage() {
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-white dark:bg-gray-900">
        <LoginForm />
      </div>

      {/* Right side - Hero image */}
      <div className="w-full md:w-1/2 hidden md:block relative hero-gradient">
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white p-12">
          <h1 className="text-4xl font-display font-bold mb-6 text-center">
            Embark on Your Epic Journey
          </h1>
          <p className="text-xl max-w-md text-center mb-8">
            Create your character, forge your destiny, and write your own legend in a world powered by AI.
          </p>
          <div className="flex space-x-4">
            <div className="bg-white bg-opacity-20 backdrop-blur-md p-4 rounded-lg">
              <p className="text-lg font-bold">Immersive Stories</p>
              <p className="text-sm">AI-generated narratives that adapt to your choices</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-md p-4 rounded-lg">
              <p className="text-lg font-bold">Unlimited Choices</p>
              <p className="text-sm">Every decision shapes your unique adventure</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}