import { NextRequest, NextResponse } from "next/server";
import { apiRouteClient } from "@/utils/apiRoutes";
import { ApiRouteError } from "@/types/api.types";

export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") || "";
    const api = apiRouteClient(cookie);

    const response = await api.post("/auth/logout", {});

    // Tạo response với cookie đã xóa
    const nextResponse = NextResponse.json(response.data);

    // Xóa cookie JWT
    nextResponse.cookies.delete("jwt");

    return nextResponse;
  } catch (error: unknown) {
    const apiError = error as ApiRouteError;
    console.error(
      "Error logging out:",
      apiError.response?.data || apiError.message
    );
    return NextResponse.json(
      { message: apiError.response?.data?.message || "Failed to logout" },
      { status: apiError.response?.status || 500 }
    );
  }
}
