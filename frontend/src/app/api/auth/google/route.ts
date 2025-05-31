import { NextResponse } from "next/server";

export function GET() {
  // Get the base URL from environment variables or use default
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // Chuyển hướng đến endpoint Google OAuth của backend
  return NextResponse.redirect(`${baseURL}/auth/google`);
}
