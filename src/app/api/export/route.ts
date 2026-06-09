import { NextRequest, NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";
import ExcelJS from "exceljs";

type Visitor = {
  id: number;
  name: string;
  company: string;
  purpose: string;
  host: string;
  email: string | null;
  phone: string | null;
  photo: string | null;
  signed_in_at: string;
  signed_out_at: string | null;
};

function fmt(iso: string, type: "date" | "time") {
  const d = new Date(iso);
  if (type === "date")
    return d.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
  return d.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function durLabel(signedIn: string, signedOut: string | null): string {
  if (!signedOut) return "On Site";
  const ms = new Date(signedOut).getTime() - new Date(signedIn).getTime();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const format = searchParams.get("format") ?? "csv";
  const from   = searchParams.get("from")   ?? undefined;
  const to     = searchParams.get("to")     ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  await initDb();
  const db = getDb();

  const conditions: string[] = [];
  const args: string[] = [];
  if (from)   { conditions.push("DATE(signed_in_at) >= ?"); args.push(from); }
  if (to)     { conditions.push("DATE(signed_in_at) <= ?"); args.push(to); }
  if (search) {
    conditions.push("(name LIKE ? OR company LIKE ? OR host LIKE ?)");
    const like = `%${search}%`;
    args.push(like, like, like);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await db.execute({ sql: `SELECT * FROM visitors ${where} ORDER BY signed_in_at DESC`, args });
  const visitors = result.rows as unknown as Visitor[];

  /* ── CSV ── */
  if (format === "csv") {
    const headers = [
      "Visitor Name", "Company", "Purpose of Visit", "Host",
      "Email", "Phone", "Date", "Time In", "Time Out", "Duration", "Photo URL",
    ];
    const escape = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [
      headers.map(escape).join(","),
      ...visitors.map((v) =>
        [
          v.name, v.company, v.purpose, v.host,
          v.email ?? "", v.phone ?? "",
          fmt(v.signed_in_at, "date"), fmt(v.signed_in_at, "time"),
          v.signed_out_at ? fmt(v.signed_out_at, "time") : "On Site",
          durLabel(v.signed_in_at, v.signed_out_at),
          v.photo ?? "",
        ].map(escape).join(",")
      ),
    ];
    return new NextResponse(lines.join("\r\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="visitor-log-${Date.now()}.csv"`,
      },
    });
  }

  /* ── XLSX with embedded photos ── */
  if (format === "xlsx") {
    const wb = new ExcelJS.Workbook();
    wb.creator = "Van Giessen Growers Inc.";
    wb.created = new Date();
    const ws = wb.addWorksheet("Visitor Log");
    const ROW_HEIGHT = 55;
    const PHOTO_COL  = 1;

    ws.columns = [
      { header: "Photo",            key: "photo",   width: 10 },
      { header: "Visitor Name",     key: "name",    width: 22 },
      { header: "Company",          key: "company", width: 20 },
      { header: "Purpose of Visit", key: "purpose", width: 36 },
      { header: "Host",             key: "host",    width: 20 },
      { header: "Email",            key: "email",   width: 28 },
      { header: "Phone",            key: "phone",   width: 16 },
      { header: "Date",             key: "date",    width: 14 },
      { header: "Time In",          key: "timeIn",  width: 10 },
      { header: "Time Out",         key: "timeOut", width: 10 },
      { header: "Duration",         key: "dur",     width: 10 },
    ];

    const headerRow = ws.getRow(1);
    headerRow.height = 20;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FF374151" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    for (let i = 0; i < visitors.length; i++) {
      const v = visitors[i];
      const rowNum = i + 2;
      const row = ws.getRow(rowNum);
      row.height = ROW_HEIGHT;

      row.getCell(2).value  = v.name;
      row.getCell(3).value  = v.company;
      row.getCell(4).value  = v.purpose;
      row.getCell(5).value  = v.host;
      row.getCell(6).value  = v.email ?? "";
      row.getCell(7).value  = v.phone ?? "";
      row.getCell(8).value  = fmt(v.signed_in_at, "date");
      row.getCell(9).value  = fmt(v.signed_in_at, "time");
      row.getCell(10).value = v.signed_out_at ? fmt(v.signed_out_at, "time") : "On Site";
      row.getCell(11).value = durLabel(v.signed_in_at, v.signed_out_at);

      row.eachCell({ includeEmpty: true }, (cell, colNum) => {
        if (colNum > PHOTO_COL) {
          cell.alignment = { vertical: "middle", wrapText: colNum === 4 };
        }
      });

      // Fetch photo from Blob URL and embed in Excel
      if (v.photo && v.photo.startsWith("http")) {
        try {
          const res = await fetch(v.photo);
          if (res.ok) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const imageId = wb.addImage({ buffer: (await res.arrayBuffer()) as any, extension: "jpeg" });
            ws.addImage(imageId, {
              tl: { col: PHOTO_COL - 1 + 0.1, row: rowNum - 1 + 0.1 } as never,
              br: { col: PHOTO_COL + 0.9, row: rowNum + 0.9 } as never,
            });
          }
        } catch { /* skip photo on fetch error */ }
      }

      row.commit();
    }

    const buf = Buffer.from(await wb.xlsx.writeBuffer());
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="visitor-log-${Date.now()}.xlsx"`,
      },
    });
  }

  return NextResponse.json({ error: "Unknown format" }, { status: 400 });
}
