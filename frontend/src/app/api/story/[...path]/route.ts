import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/utils/session";

// Hàm chuyển tiếp request đến backend
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join("/");
  const session = await getSession();

  // URL backend
  const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";
  const url = `${backendUrl}/story/${path}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Thêm token xác thực nếu có
  if (session?.accessToken) {
    headers["Authorization"] = `Bearer ${session.accessToken}`;
  }

  try {
    const response = await fetch(url, {
      headers,
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error forwarding GET request to ${url}:`, error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join("/");
  const session = await getSession();
  const body = await request.json();

  // URL backend
  const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";
  const url = `${backendUrl}/story/${path}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Thêm token xác thực nếu có
  if (session?.accessToken) {
    headers["Authorization"] = `Bearer ${session.accessToken}`;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error forwarding POST request to ${url}:`, error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
