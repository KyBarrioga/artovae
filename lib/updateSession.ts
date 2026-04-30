import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const requiresAuth = pathname.startsWith("/user") || pathname === "/setup";
  const accessToken = request.cookies.get("picsal_access_token")?.value;
  const refreshToken = request.cookies.get("picsal_refresh_token")?.value;
  const hasSession = Boolean(accessToken || refreshToken);

  if (requiresAuth && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(`${pathname}${search}`)}`;

    return NextResponse.redirect(url);
  }

  if ((pathname === "/login" || pathname === "/signup") && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/user";
    url.search = "";

    return NextResponse.redirect(url);
  }

  return NextResponse.next({
    request,
  });
}
