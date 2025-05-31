import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Lấy danh sách nhân vật
export async function GET(request: NextRequest) {
  try {
    const response = await axios.get("http://localhost:3001/game/characters", {
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
      withCredentials: true,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(
      "Error fetching characters:",
      error.response?.data || error.message
    );
    return NextResponse.json(
      {
        message: error.response?.data?.message || "Failed to fetch characters",
      },
      { status: error.response?.status || 500 }
    );
  }
}

// Tạo nhân vật mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await axios.post(
      "http://localhost:3001/game/characters",
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
      "Error creating character:",
      error.response?.data || error.message
    );
    return NextResponse.json(
      {
        message: error.response?.data?.message || "Failed to create character",
      },
      { status: error.response?.status || 500 }
    );
  }
}
