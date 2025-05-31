import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    const response = await axios.get("http://localhost:3001/auth/status", {
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
      withCredentials: true,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    // Nếu lỗi 401 (Unauthorized), trả về isAuthenticated: false
    if (error.response?.status === 401) {
      return NextResponse.json({ isAuthenticated: false });
    }

    console.error(
      "Error checking auth status:",
      error.response?.data || error.message
    );
    return NextResponse.json(
      {
        isAuthenticated: false,
        message:
          error.response?.data?.message ||
          "Failed to check authentication status",
      },
      { status: error.response?.status || 500 }
    );
  }
}
