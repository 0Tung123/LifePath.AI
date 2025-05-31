import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const response = await axios.post(
      "http://localhost:3001/auth/logout",
      {},
      {
        headers: {
          Cookie: request.headers.get("cookie") || "",
        },
        withCredentials: true,
      }
    );

    // Tạo response với cookie đã xóa
    const nextResponse = NextResponse.json(response.data);

    // Xóa cookie JWT
    nextResponse.cookies.delete("jwt");

    return nextResponse;
  } catch (error: any) {
    console.error("Error logging out:", error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || "Failed to logout" },
      { status: error.response?.status || 500 }
    );
  }
}
