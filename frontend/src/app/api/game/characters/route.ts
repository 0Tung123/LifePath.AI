import { NextRequest, NextResponse } from "next/server";
import { apiRouteClient } from "@/utils/apiRoutes";
import { ApiRouteError } from "@/types/api.types";

// Lấy danh sách nhân vật
export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") || "";
    const api = apiRouteClient(cookie);

    const response = await api.get("/game/characters");

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const apiError = error as ApiRouteError;
    console.error(
      "Error fetching characters:",
      apiError.response?.data || apiError.message
    );
    return NextResponse.json(
      {
        message:
          apiError.response?.data?.message || "Failed to fetch characters",
      },
      { status: apiError.response?.status || 500 }
    );
  }
}

// Tạo nhân vật mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookie = request.headers.get("cookie") || "";
    const api = apiRouteClient(cookie);

    const response = await api.post("/game/characters", body);

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const apiError = error as ApiRouteError;
    console.error(
      "Error creating character:",
      apiError.response?.data || apiError.message
    );
    return NextResponse.json(
      {
        message:
          apiError.response?.data?.message || "Failed to create character",
      },
      { status: apiError.response?.status || 500 }
    );
  }
}
