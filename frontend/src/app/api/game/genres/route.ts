import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Lấy danh sách thể loại game
export async function GET(request: NextRequest) {
  try {
    const response = await axios.get("http://localhost:3001/game/genres", {
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
      withCredentials: true,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(
      "Error fetching game genres:",
      error.response?.data || error.message
    );
    return NextResponse.json(
      {
        message: error.response?.data?.message || "Failed to fetch game genres",
      },
      { status: error.response?.status || 500 }
    );
  }
}
