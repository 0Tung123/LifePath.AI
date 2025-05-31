import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { ApiRouteError } from "@/types/api.types";

// Thực hiện lựa chọn trong game
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; choiceId: string }> }
) {
  try {
    const { id, choiceId } = await params;

    const response = await axios.post(
      `http://localhost:3000/game/sessions/${id}/choices/${choiceId}`,
      {},
      {
        headers: {
          Cookie: request.headers.get("cookie") || "",
        },
        withCredentials: true,
      }
    );

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const apiError = error as ApiRouteError;
    console.error(
      "Error making choice:",
      apiError.response?.data || apiError.message
    );
    return NextResponse.json(
      { message: apiError.response?.data?.message || "Failed to make choice" },
      { status: apiError.response?.status || 500 }
    );
  }
}
