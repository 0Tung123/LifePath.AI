import { NextRequest, NextResponse } from "next/server";
import { apiRouteClient } from "@/utils/apiRoutes";
import { ApiRouteError } from "@/types/api.types";

export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") || "";
    const api = apiRouteClient(cookie);

    const response = await api.get("/auth/status");

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const apiError = error as ApiRouteError;
    // Nếu lỗi 401 (Unauthorized), trả về isAuthenticated: false
    if (apiError.response?.status === 401) {
      return NextResponse.json({ isAuthenticated: false });
    }

    console.error(
      "Error checking auth status:",
      apiError.response?.data || apiError.message
    );
    return NextResponse.json(
      {
        isAuthenticated: false,
        message:
          apiError.response?.data?.message ||
          "Failed to check authentication status",
      },
      { status: apiError.response?.status || 500 }
    );
  }
}
