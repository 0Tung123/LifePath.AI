"use client";
import { useState } from "react";
import Link from "next/link";
import api from "@/utils/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setIsSubmitted(true);
    } catch (err: unknown) {
      console.error("Forgot password error:", err);
      if (typeof err === "object" && err !== null && "response" in err) {
        const apiError = err as {
          response?: {
            data?: {
              message?: string;
            };
          };
        };
        if (apiError.response?.data?.message) {
          setError(apiError.response.data.message);
        } else {
          setError("Failed to process your request. Please try again later.");
        }
      } else {
        setError("Failed to process your request. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-900 to-gray-800 px-4">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-8">
        {!isSubmitted ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white">Forgot Password</h2>
              <p className="mt-2 text-gray-400">
                Enter your email address and we&apos;ll send you a link to reset
                your password
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-900/50 border border-red-500 rounded-md text-red-200 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-white"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg px-4 py-3 font-medium flex items-center justify-center"
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : null}
                  Send Reset Link
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-900/30 mb-6">
              <svg
                className="w-8 h-8 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Check Your Email
            </h2>
            <p className="text-gray-400 mb-6">
              We&apos;ve sent a password reset link to{" "}
              <span className="text-blue-400">{email}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              If you don&apos;t see the email, check other places it might be,
              like your spam, junk, social, or other folders.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Use a different email address
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/auth/login"
            className="text-blue-400 hover:text-blue-300 font-medium flex items-center justify-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
