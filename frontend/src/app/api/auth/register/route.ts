import { NextRequest, NextResponse } from "next/server";
import { apiRouteClient } from "@/utils/apiRoutes";
import { ApiRouteError } from "@/types/api.types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const api = apiRouteClient();

    const response = await api.post("/auth/register", body);

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const apiError = error as ApiRouteError;
    console.error(
      "Error registering:",
      apiError.response?.data || apiError.message
    );
    return NextResponse.json(
      { message: apiError.response?.data?.message || "Failed to register" },
      { status: apiError.response?.status || 500 }
    );
  }
}
