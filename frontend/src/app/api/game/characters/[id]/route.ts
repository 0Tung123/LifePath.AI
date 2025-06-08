import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { ApiRouteError } from "@/types/api.types";

// Lấy thông tin chi tiết nhân vật
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await axios.get(
      `http://localhost:3000/game/characters/${id}`,
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
      "Error fetching character:",
      apiError.response?.data || apiError.message
    );
    return NextResponse.json(
      {
        message:
          apiError.response?.data?.message || "Failed to fetch character",
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

// Xóa nhân vật
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await axios.delete(
      `http://localhost:3000/game/characters/${id}`,
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
      "Error deleting character:",
      apiError.response?.data || apiError.message
    );
    return NextResponse.json(
      {
        message:
          apiError.response?.data?.message || "Failed to delete character",
      },
      { status: apiError.response?.status || 500 }
    );
  }
}
