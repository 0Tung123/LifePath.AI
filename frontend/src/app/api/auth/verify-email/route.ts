import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await axios.post(
      "http://localhost:3001/auth/verify-email",
      body,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(
      "Error verifying email:",
      error.response?.data || error.message
    );
    return NextResponse.json(
      { message: error.response?.data?.message || "Failed to verify email" },
      { status: error.response?.status || 500 }
    );
  }
}
