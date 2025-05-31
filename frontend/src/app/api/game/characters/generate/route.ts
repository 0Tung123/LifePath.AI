import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { ApiRouteError } from "@/types/api.types";

// Tạo nhân vật bằng AI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await axios.post(
      "http://localhost:3000/game/characters/generate",
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
  } catch (error: unknown) {
    const apiError = error as ApiRouteError;
    console.error(
      "Error generating character:",
      apiError.response?.data || apiError.message
    );
    return NextResponse.json(
      {
        message:
          apiError.response?.data?.message || "Failed to generate character",
      },
      { status: apiError.response?.status || 500 }
    );
  }
}
