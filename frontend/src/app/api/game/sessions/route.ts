import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Lấy danh sách phiên game
export async function GET(request: NextRequest) {
  try {
    const response = await axios.get("http://localhost:3001/game/sessions", {
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
      withCredentials: true,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(
      "Error fetching game sessions:",
      error.response?.data || error.message
    );
    return NextResponse.json(
      {
        message:
          error.response?.data?.message || "Failed to fetch game sessions",
      },
      { status: error.response?.status || 500 }
    );
  }
}

// Tạo phiên game mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await axios.post(
      "http://localhost:3001/game/sessions",
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
      "Error creating game session:",
      error.response?.data || error.message
    );
    return NextResponse.json(
      {
        message:
          error.response?.data?.message || "Failed to create game session",
      },
      { status: error.response?.status || 500 }
    );
  }
}
