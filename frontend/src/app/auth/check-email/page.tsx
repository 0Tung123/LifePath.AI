"use client";
import { useState } from "react";
import Link from "next/link";
import api from "@/utils/api";

export default function CheckEmail() {
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleResendVerification = async () => {
    if (!email.trim()) {
      setResendStatus("error");
      setErrorMessage("Please enter your email address");
      return;
    }

    setIsResending(true);
    setResendStatus("idle");
    setErrorMessage("");

    try {
      await api.post("/auth/resend-verification", { email });
      setResendStatus("success");
    } catch (err: unknown) {
      console.error("Resend verification error:", err);
      setResendStatus("error");
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data
      ) {
        setErrorMessage(err.response.data.message as string);
      } else {
        setErrorMessage(
          "Failed to resend verification email. Please try again later."
        );
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-900 to-gray-800 px-4">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-900/30 mb-6">
          <svg
            className="w-8 h-8 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            ></path>
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
        <p className="text-gray-400 mb-6">
          We&apos;ve sent a verification link to your email address. Please
          check your inbox and click the link to verify your account.
        </p>

        <p className="text-sm text-gray-500 mb-8">
          If you don&apos;t see the email, check other places it might be, like
          your spam, junk, social, or other folders.
        </p>

        <div className="bg-gray-700 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-white mb-4">
            Didn&apos;t receive the email?
          </h3>

          {resendStatus === "success" && (
            <div className="mb-4 p-3 bg-green-900/50 border border-green-500 rounded-md text-green-200 text-sm">
              Verification email resent successfully. Please check your inbox.
            </div>
          )}

          {resendStatus === "error" && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-md text-red-200 text-sm">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 bg-gray-600 border border-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-white"
            />
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isResending ? (
                <svg
                  className="animate-spin h-5 w-5"
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
              ) : (
                "Resend"
              )}
            </button>
          </div>
        </div>

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
  );
}
