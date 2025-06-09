"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";

export default function Home() {
  const [message, setMessage] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    api
      .get("/")
      .then((res) => {
        setMessage(res.data.message);
        setIsLoaded(true);
      })
      .catch((err) => console.error("API Error:", err));
  }, []);

  // Only show content when loaded and display message if available
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {isLoaded && message && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-md z-50">
          {message}
        </div>
      )}
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></div>
          <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] bg-center"></div>
        </div>

        <div className="z-10 text-center max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            AI Companion for Your Digital Journey
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-300">
            Experience the future of AI interaction with personalized
            conversations, intelligent assistance, and continual learning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/login"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-medium"
            >
              Get Started
            </Link>
            <Link
              href="/auth/register"
              className="border-2 border-white text-white px-8 py-3 rounded-full font-medium hover:bg-white/10"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-blue-400">
            Powered by Advanced AI Technology
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard
              title="Personalized AI Companion"
              description="Your AI companion learns from every interaction, providing increasingly personalized responses and assistance."
            />
            <FeatureCard
              title="Secure Conversations"
              description="All your interactions are encrypted and private, ensuring your data remains secure."
            />
            <FeatureCard
              title="Seamless Integration"
              description="Works across all your devices and integrates with your favorite tools and applications."
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-900 to-purple-900">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Experience the Future?
          </h2>
          <p className="text-xl mb-10 text-gray-300">
            Join thousands of users already transforming their digital
            experience with our AI platform.
          </p>
          <Link
            href="/auth/register"
            className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-3 rounded-full font-medium"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>
    </main>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
}

function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="bg-gray-900 p-8 rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-300">
      <div className="w-16 h-16 mb-6 bg-blue-900/30 rounded-lg flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold mb-4 text-blue-300">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
