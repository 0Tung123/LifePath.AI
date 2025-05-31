import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { ApiRouteError } from "@/types/api.types";

// Lấy thông tin chi tiết phiên game
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await axios.get(
      `http://localhost:3000/game/sessions/${id}`,
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
      "Error fetching game session:",
      apiError.response?.data || apiError.message
    );
    return NextResponse.json(
      {
        message:
          apiError.response?.data?.message || "Failed to fetch game session",
      },
      { status: apiError.response?.status || 500 }
    );
  }
}
