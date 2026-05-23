import { NextResponse } from "next/server";
import type { ApiError, ApiSuccess } from "@/types";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccess<T>>({ success: true, data }, { status });
}

export function fail(code: string, message: string, status = 400) {
  return NextResponse.json<ApiError>(
    { success: false, error: { code, message } },
    { status },
  );
}
