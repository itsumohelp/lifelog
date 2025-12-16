import {NextResponse} from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    buildSha: process.env.APP_BUILD_SHA ?? "unknown",
  });
}
