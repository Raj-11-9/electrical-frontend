import { NextRequest, NextResponse } from "next/server";
import { hasCustomerSession } from "@/lib/customer-session";
const allowed = new Set([
  "login",
  "register",
  "me",
  "quote",
  "orders",
  "addresses",
  "track",
  "payments/verify",
  "logout",
]);
async function handle(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const path = (await context.params).path.join("/");
  if (!allowed.has(path))
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  const requestOrigin=req.headers.get("origin");
  let sameOrigin=false;
  try{const origin=new URL(requestOrigin||"");sameOrigin=origin.host===req.headers.get("host")&&["http:","https:"].includes(origin.protocol);}catch{}
  if (req.method === "POST" && !sameOrigin)
    return NextResponse.json(
      { message: "Invalid request origin" },
      { status: 403 },
    );
  if ((path === "me" ? "GET" : "POST") !== req.method) return NextResponse.json({message:"Method not allowed"},{status:405});
  if (path === "logout") {
    const r = NextResponse.json({ ok: true });
    r.cookies.set("srv-session", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
    return r;
  }
  try {
    const token = req.cookies.get("srv-session")?.value;
    if (path === "orders" && !await hasCustomerSession(token)) {
      return NextResponse.json({ message: "Please log in first to place your order." }, { status: 401 });
    }
    const upstream = await fetch(
      (process.env.API_URL || "http://127.0.0.1:4000/api") +
        "/commerce/" +
        path,
      {
        method: req.method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
        body: req.method === "POST" ? await req.text() : undefined,
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      },
    );
    const data = await upstream.json();
    const session = data.token;
    if (session) delete data.token;
    const response = NextResponse.json(data, {
      status: upstream.status,
      headers: { "Cache-Control": "no-store" },
    });
    if (session && upstream.ok)
      response.cookies.set("srv-session", session, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 3600,
      });
    return response;
  } catch {
    return NextResponse.json(
      {
        message:
          "The order service is temporarily unavailable. Your cart has been kept. Please try again.",
      },
      { status: 503 },
    );
  }
}
export const GET = handle;
export const POST = handle;
