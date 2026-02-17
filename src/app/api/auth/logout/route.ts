import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";
import { getAppBaseUrl } from "@/lib/app-base-url";

export async function POST(request: Request) {
  const appBaseUrl = getAppBaseUrl(request);
  await clearSessionCookie();
  return NextResponse.redirect(new URL("/login", appBaseUrl), 303);
}
