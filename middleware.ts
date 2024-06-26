import { NextRequest, NextResponse } from "next/server";
import { ACCESS_CODES } from "./app/api/access";
import md5 from "spark-md5";

export const config = {
  matcher: ["/api/openai", "/api/chat-stream"],
};

export function middleware(req: NextRequest) {
  const accessCode = req.headers.get("access-code");
  const hashedCode = md5.hash(accessCode ?? "").trim();

  if (ACCESS_CODES.size > 0 && !ACCESS_CODES.has(hashedCode)) {
    return NextResponse.json(
      {
        error: true,
        needAccessCode: true,
        msg: "Please go settings page and fill your access code.",
      },
      {
        status: 401,
      },
    );
  }

  // inject api key
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    req.headers.set("token", apiKey);
  } else {
    return NextResponse.json(
      {
        error: true,
        msg: "Empty Api Key",
      },
      {
        status: 401,
      },
    );
  }

  return NextResponse.next({
    request: {
      headers: req.headers,
    },
  });
}
