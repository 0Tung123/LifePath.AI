import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Lưu phiên game
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const response = await axios.put(
      `http://localhost:3001/game/sessions/${id}/save`,
      {},
      {
        headers: {
          Cookie: request.headers.get("cookie") || "",
        },
        withCredentials: true,
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(
      "Error saving game session:",
      error.response?.data || error.message
    );
    return NextResponse.json(
      {
        message: error.response?.data?.message || "Failed to save game session",
      },
      { status: error.response?.status || 500 }
    );
  }
}
