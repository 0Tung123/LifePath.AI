import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { ApiRouteError } from "@/types/api.types";

// Lưu phiên game
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await axios.put(
      `http://localhost:3000/game/sessions/${id}/save`,
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
      "Error saving game session:",
      apiError.response?.data || apiError.message
    );
    return NextResponse.json(
      {
        message:
          apiError.response?.data?.message || "Failed to save game session",
      },
      { status: apiError.response?.status || 500 }
    );
  }
}
