'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import authService from '@/services/auth.service';

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const [message, setMessage] = useState<string>('');
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [resendMessage, setResendMessage] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage(
        'Verification token is missing. Please check your email link.',
      );
      return;
    }

    const verifyEmail = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus('success');
        setMessage(
          'Your email has been verified successfully! You can now log in to your account.',
        );
      } catch (error: unknown) {
        setStatus('error');
        if (
          error &&
          typeof error === 'object' &&
          'response' in error &&
          error.response &&
          typeof error.response === 'object' &&
          'status' in error.response &&
          error.response.status === 400
        ) {
          setMessage(
            'Invalid or expired verification token. Please request a new verification email.',
          );
        } else {
          setMessage(
            'Failed to verify email. Please try again or contact support.',
          );
        }
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setResendMessage('Please enter your email address.');
      return;
    }

    setResendLoading(true);
    setResendMessage('');

    try {
      await authService.resendVerification({ email });
      setResendMessage(
        'Verification email sent successfully! Please check your inbox.',
      );
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'status' in error.response &&
        error.response.status === 400
      ) {
        setResendMessage('Email is already verified or user not found.');
      } else {
        setResendMessage(
          'Failed to send verification email. Please try again.',
        );
      }
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Email Verification
          </h1>
        </div>

        {/* Verification Status */}
        <div className="text-center">
          {status === 'loading' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-gray-600">Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <svg
                    className="h-8 w-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <div className="p-4 text-green-700 bg-green-100 rounded-md">
                {message}
              </div>
              <button
                onClick={handleGoToLogin}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Go to Login
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-red-100 p-3">
                  <svg
                    className="h-8 w-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
              <div className="p-4 text-red-700 bg-red-100 rounded-md">
                {message}
              </div>

              {/* Resend Verification Form */}
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Need a new verification email?
                </h3>
                <form onSubmit={handleResendVerification} className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                  />
                  <button
                    type="submit"
                    disabled={resendLoading}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                </form>
                {resendMessage && (
                  <div
                    className={`mt-3 p-3 rounded-md text-sm ${
                      resendMessage.includes('successfully')
                        ? 'text-green-700 bg-green-100'
                        : 'text-red-700 bg-red-100'
                    }`}
                  >
                    {resendMessage}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="text-center text-sm text-gray-600">
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Back to Login
          </Link>
          {' | '}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
