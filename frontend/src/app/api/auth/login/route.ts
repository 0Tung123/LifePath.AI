import { NextRequest, NextResponse } from "next/server";
import { apiRouteClient } from "@/utils/apiRoutes";
import { ApiRouteError } from "@/types/api.types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const api = apiRouteClient();

    const response = await api.post("/auth/login", body);

    // Lấy cookie từ response
    const cookies = response.headers["set-cookie"];

    // Tạo response với cookie
    const nextResponse = NextResponse.json(response.data);

    // Thêm cookie từ backend vào response
    if (cookies) {
      for (const cookie of cookies) {
        const match = cookie.match(/^([^=]+)=([^;]+)/);
        if (match) {
          const name = match[1].trim();
          const value = match[2].trim();

          // Chỉ thêm cookie JWT
          if (name === "jwt") {
            nextResponse.cookies.set({
              name,
              value,
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
            });
          }
        }
      }
    }

    return nextResponse;
  } catch (error: unknown) {
    const apiError = error as ApiRouteError;
    console.error(
      "Error logging in:",
      apiError.response?.data || apiError.message
    );
    return NextResponse.json(
      { message: apiError.response?.data?.message || "Failed to login" },
      { status: apiError.response?.status || 500 }
    );
  }
}
