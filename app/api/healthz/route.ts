import {NextResponse} from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    buildSha: process.env.APP_BUILD_SHA ?? "unknown",
    buildTime: process.env.APP_BUILD_TIME ?? "unknown",
    nodeEnv: process.env.NODE_ENV ?? "unknown",
  });
}
