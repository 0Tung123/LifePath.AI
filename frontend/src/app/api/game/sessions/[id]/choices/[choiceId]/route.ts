import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Thực hiện lựa chọn trong game
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; choiceId: string } }
) {
  try {
    const { id, choiceId } = params;

    const response = await axios.post(
      `http://localhost:3001/game/sessions/${id}/choices/${choiceId}`,
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
      "Error making choice:",
      error.response?.data || error.message
    );
    return NextResponse.json(
      { message: error.response?.data?.message || "Failed to make choice" },
      { status: error.response?.status || 500 }
    );
  }
}
