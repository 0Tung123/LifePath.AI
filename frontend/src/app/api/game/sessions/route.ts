import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { ApiRouteError } from "@/types/api.types";

// Lấy danh sách phiên game
export async function GET(request: NextRequest) {
  try {
    const response = await axios.get("http://localhost:3000/game/sessions", {
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
      withCredentials: true,
    });

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const apiError = error as ApiRouteError;
    console.error(
      "Error fetching game sessions:",
      apiError.response?.data || apiError.message
    );
    return NextResponse.json(
      {
        message:
          apiError.response?.data?.message || "Failed to fetch game sessions",
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

// Tạo phiên game mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await axios.post(
      "http://localhost:3000/game/sessions",
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
      "Error creating game session:",
      apiError.response?.data || apiError.message
    );
    return NextResponse.json(
      {
        message:
          apiError.response?.data?.message || "Failed to create game session",
      },
      { status: apiError.response?.status || 500 }
    );
  }
}
