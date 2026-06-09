import { NextResponse } from "next/server";

// Photos are now stored in Vercel Blob and served directly via their public URL.
// This route is kept for backward compatibility but returns 404 for old local filenames.
export async function GET() {
  return new NextResponse("Not found — photos are now served from Vercel Blob.", { status: 404 });
}
