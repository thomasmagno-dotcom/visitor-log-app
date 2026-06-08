import { NextRequest, NextResponse } from "next/server";
import { PHOTOS_DIR } from "@/lib/db";
import path from "path";
import fs from "fs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // Prevent path traversal
  const safe = path.basename(filename);
  if (!safe.match(/^[a-f0-9-]+\.jpg$/)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = path.join(PHOTOS_DIR, safe);
  if (!fs.existsSync(filePath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "private, max-age=31536000",
    },
  });
}
