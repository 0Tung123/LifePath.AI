import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Tạo nhân vật bằng AI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await axios.post(
      "http://localhost:3001/game/characters/generate",
      body,
      {
        headers: {
          Cookie: request.headers.get("cookie") || "",
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(
      "Error generating character:",
      error.response?.data || error.message
    );
    return NextResponse.json(
      {
        message:
          error.response?.data?.message || "Failed to generate character",
      },
      { status: error.response?.status || 500 }
    );
  }
}
