import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import * as XLSX from "xlsx";

type Visitor = {
  id: number;
  name: string;
  company: string;
  purpose: string;
  host: string;
  signed_in_at: string;
  signed_out_at: string | null;
};

function fmt(iso: string, type: "date" | "time") {
  const d = new Date(iso);
  if (type === "date")
    return d.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
  return d.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function durMinutes(signedIn: string, signedOut: string | null): string {
  if (!signedOut) return "On Site";
  const ms = new Date(signedOut).getTime() - new Date(signedIn).getTime();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function buildQuery(from?: string, to?: string, search?: string) {
  const conditions: string[] = [];
  const params: string[] = [];

  if (from) { conditions.push("DATE(signed_in_at) >= ?"); params.push(from); }
  if (to)   { conditions.push("DATE(signed_in_at) <= ?"); params.push(to); }
  if (search) {
    conditions.push("(name LIKE ? OR company LIKE ? OR host LIKE ?)");
    const like = `%${search}%`;
    params.push(like, like, like);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return { where, params };
}

function toRows(visitors: Visitor[]) {
  return visitors.map((v) => ({
    "Visitor Name": v.name,
    Company: v.company,
    "Purpose of Visit": v.purpose,
    Host: v.host,
    Date: fmt(v.signed_in_at, "date"),
    "Time In": fmt(v.signed_in_at, "time"),
    "Time Out": v.signed_out_at ? fmt(v.signed_out_at, "time") : "On Site",
    Duration: durMinutes(v.signed_in_at, v.signed_out_at),
  }));
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const format = searchParams.get("format") ?? "csv";
  const from   = searchParams.get("from")   ?? undefined;
  const to     = searchParams.get("to")     ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  const db = getDb();
  const { where, params } = buildQuery(from, to, search);
  const visitors = db
    .prepare(`SELECT * FROM visitors ${where} ORDER BY signed_in_at DESC`)
    .all(...params) as Visitor[];

  const rows = toRows(visitors);

  /* ── CSV ── */
  if (format === "csv") {
    const headers = Object.keys(rows[0] ?? {
      "Visitor Name": "", Company: "", "Purpose of Visit": "", Host: "",
      Date: "", "Time In": "", "Time Out": "", Duration: "",
    });
    const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = [
      headers.map(escape).join(","),
      ...rows.map((r) => headers.map((h) => escape(r[h as keyof typeof r])).join(",")),
    ];
    return new NextResponse(lines.join("\r\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="visitor-log-${Date.now()}.csv"`,
      },
    });
  }

  /* ── XLSX ── */
  if (format === "xlsx") {
    const ws = XLSX.utils.json_to_sheet(rows);
    // Column widths
    ws["!cols"] = [22, 20, 36, 20, 14, 10, 10, 10].map((w) => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Visitor Log");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="visitor-log-${Date.now()}.xlsx"`,
      },
    });
  }

  return NextResponse.json({ error: "Unknown format" }, { status: 400 });
}
