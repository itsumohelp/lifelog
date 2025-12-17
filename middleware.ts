import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";

export function middleware(req: NextRequest) {
  // /api/tesla/login だけを門番
  if (req.nextUrl.pathname === "/api/tesla/login") {
    const consent = req.cookies.get("mf_tesla_consent")?.value;
    if (consent !== "1") {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard/consent";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/tesla/login"],
};
