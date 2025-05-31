import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  // Chuyển hướng đến endpoint Google OAuth của backend
  return NextResponse.redirect("http://localhost:3001/auth/google");
}
