import { NextRequest, NextResponse } from "next/server";
import { apiRouteClient } from "@/utils/apiRoutes";
import { ApiRouteError } from "@/types/api.types";

// Lấy danh sách thể loại game
export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") || "";
    const api = apiRouteClient(cookie);

    const response = await api.get("/game/genres");

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const apiError = error as ApiRouteError;
    console.error(
      "Error fetching game genres:",
      apiError.response?.data || apiError.message
    );
    return NextResponse.json(
      {
        message: apiError.response?.data?.message || "Failed to fetch game genres",
      },
      { status: apiError.response?.status || 500 }
    );
  }
}
