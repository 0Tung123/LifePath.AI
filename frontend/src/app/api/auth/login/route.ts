import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await axios.post(
      "http://localhost:3001/auth/login",
      body,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

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
  } catch (error: any) {
    console.error("Error logging in:", error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || "Failed to login" },
      { status: error.response?.status || 500 }
    );
  }
}
