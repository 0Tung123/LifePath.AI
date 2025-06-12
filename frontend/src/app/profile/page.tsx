"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import authService from "@/services/auth.service";
import Header from "@/components/Header";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, refreshProfile } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Set form values when user data is loaded
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset to original values
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }
    setIsEditing(false);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      // Call the updateProfile method we added to auth service
      await authService.updateProfile({
        firstName,
        lastName,
      });

      // Refresh the user context with our new method
      await refreshProfile();

      setMessage({
        text: "Profile updated successfully!",
        type: "success",
      });
      setIsEditing(false);
    } catch (error) {
      setMessage({
        text:
          "Failed to update profile. Please try again.",
        type: "error",
      });
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Your Profile
          </h1>

          {message && (
            <div
              className={`mb-6 p-4 rounded-md ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-gray-700"
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-4 mt-6">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Email
                      </h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {user?.email}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Account Status
                      </h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {user?.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending Verification
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        First Name
                      </h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {user?.firstName || "-"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Last Name
                      </h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {user?.lastName || "-"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Joined
                      </h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-4 mt-6">
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-500"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
