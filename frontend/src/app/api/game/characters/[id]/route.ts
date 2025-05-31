import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Lấy thông tin chi tiết nhân vật
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const response = await axios.get(
      `http://localhost:3001/game/characters/${id}`,
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
      "Error fetching character:",
      error.response?.data || error.message
    );
    return NextResponse.json(
      { message: error.response?.data?.message || "Failed to fetch character" },
      { status: error.response?.status || 500 }
    );
  }
}
