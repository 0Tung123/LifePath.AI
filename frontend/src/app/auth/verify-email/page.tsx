"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/store/AuthContext";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState("loading"); // loading, success, error
  const [error, setError] = useState("");

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      verifyEmail(tokenParam);
    } else {
      setVerificationStatus("error");
      setError(
        "Verification token is missing. Please use the link from your email."
      );
    }
  }, [searchParams]);

  const { verifyEmail: verifyEmailApi } = useAuth();

  const verifyEmail = async (verificationToken: string) => {
    try {
      await verifyEmailApi(verificationToken);
      setVerificationStatus("success");
    } catch (err: unknown) {
      console.error("Email verification error:", err);
      setVerificationStatus("error");
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to verify your email. The link may have expired.");
      }
    }
  };

  const handleResendVerification = async () => {
    try {
      // Redirect to the check-email page where users can request a new verification email
      window.location.href = "/auth/check-email";
    } catch (err: unknown) {
      console.error("Resend verification error:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-900 to-gray-800 px-4">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-8 text-center">
        {verificationStatus === "loading" && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-900/30 mb-6">
              <svg
                className="animate-spin w-8 h-8 text-blue-400"
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
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Verifying Your Email
            </h2>
            <p className="text-gray-400">
              Please wait while we verify your email address...
            </p>
          </>
        )}

        {verificationStatus === "success" && (
          <>
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
              Email Verified!
            </h2>
            <p className="text-gray-400 mb-6">
              Your email has been successfully verified. You can now sign in to
              your account.
            </p>
            <Link
              href="/auth/login"
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg px-6 py-2 font-medium"
            >
              Sign In
            </Link>
          </>
        )}

        {verificationStatus === "error" && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/30 mb-6">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Verification Failed
            </h2>
            <p className="text-red-400 mb-4">{error}</p>
            <p className="text-gray-400 mb-6">
              The verification link may have expired or is invalid. Please try
              requesting a new verification email.
            </p>
            <button
              onClick={handleResendVerification}
              className="inline-block bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-6 py-2 font-medium"
            >
              Resend Verification Email
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Export the default component with Suspense boundary
export default function VerifyEmail() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-900 to-gray-800 px-4">
          <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-900/30 mb-6">
              <svg
                className="animate-spin w-8 h-8 text-blue-400"
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
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Loading...</h2>
            <p className="text-gray-400">
              Please wait while we process your request...
            </p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
