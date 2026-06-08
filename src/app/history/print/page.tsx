import { getDb, PHOTOS_DIR } from "@/lib/db";
import type { SearchParams } from "@/lib/types";
import path from "path";
import fs from "fs";

type Visitor = {
  id: number;
  name: string;
  company: string;
  purpose: string;
  host: string;
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

function dur(signedIn: string, signedOut: string | null) {
  if (!signedOut) return "—";
  const ms = new Date(signedOut).getTime() - new Date(signedIn).getTime();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// Read photo from disk and encode as base64 data URI so it prints without needing the server
function photoDataUri(filename: string | null): string | null {
  if (!filename) return null;
  const filePath = path.join(PHOTOS_DIR, path.basename(filename));
  if (!fs.existsSync(filePath)) return null;
  const buf = fs.readFileSync(filePath);
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

export default async function PrintPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const from   = (sp.from   as string) || undefined;
  const to     = (sp.to     as string) || undefined;
  const search = (sp.search as string) || undefined;

  const db = getDb();
  const conditions: string[] = [];
  const params: string[] = [];
  if (from)   { conditions.push("DATE(signed_in_at) >= ?"); params.push(from); }
  if (to)     { conditions.push("DATE(signed_in_at) <= ?"); params.push(to); }
  if (search) {
    conditions.push("(name LIKE ? OR company LIKE ? OR host LIKE ?)");
    const like = `%${search}%`;
    params.push(like, like, like);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const visitors = db
    .prepare(`SELECT * FROM visitors ${where} ORDER BY signed_in_at DESC`)
    .all(...params) as Visitor[];

  const printed = new Date().toLocaleString("en-CA", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

  return (
    <html>
      <head>
        <title>Visitor Log — Van Giessen Growers Inc.</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; font-size: 11px; color: #111; padding: 24px; }
          h1 { font-size: 16px; font-weight: bold; margin-bottom: 2px; }
          .sub { font-size: 11px; color: #555; margin-bottom: 16px; }
          .print-btn { margin-bottom: 16px; padding: 6px 14px; cursor: pointer; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f0f0f0; text-align: left; padding: 6px 8px; font-size: 10px;
               text-transform: uppercase; letter-spacing: .04em; border-bottom: 1px solid #ccc; }
          td { padding: 5px 8px; border-bottom: 1px solid #e5e5e5; vertical-align: middle; }
          td.photo-cell { width: 52px; padding: 4px 6px; }
          td.photo-cell img { width: 44px; height: 44px; object-fit: cover;
                              border-radius: 4px; border: 1px solid #ddd; display: block; }
          td.photo-cell .no-photo { width: 44px; height: 44px; background: #f0f0f0;
                                    border-radius: 4px; display: flex; align-items: center;
                                    justify-content: center; font-size: 9px; color: #aaa; }
          tr:last-child td { border-bottom: none; }
          .badge { display:inline-block; padding: 1px 6px; border-radius: 9px;
                   background:#e8f5e9; color:#2e7d32; font-size:10px; }
          @media print {
            body { padding: 0; }
            .print-btn { display: none; }
          }
        `}</style>
      </head>
      <body>
        <h1>Visitor Log — Van Giessen Growers Inc.</h1>
        <p className="sub">
          Printed: {printed} &nbsp;·&nbsp; {visitors.length} record{visitors.length !== 1 ? "s" : ""}
          {(from || to) ? ` · ${from ?? ""}${from && to ? " – " : ""}${to ?? ""}` : " · All dates"}
        </p>
        <button className="print-btn" onClick="window.print()">
          Print / Save as PDF
        </button>
        <table>
          <thead>
            <tr>
              <th style={{ width: 30 }}>#</th>
              <th style={{ width: 52 }}>Photo</th>
              <th>Visitor Name</th>
              <th>Company</th>
              <th>Purpose of Visit</th>
              <th>Host</th>
              <th>Date</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {visitors.map((v, i) => {
              const uri = photoDataUri(v.photo);
              return (
                <tr key={v.id}>
                  <td style={{ color: "#999" }}>{visitors.length - i}</td>
                  <td className="photo-cell">
                    {uri
                      ? <img src={uri} alt={v.name} />
                      : <div className="no-photo">N/A</div>}
                  </td>
                  <td><strong>{v.name}</strong></td>
                  <td>{v.company}</td>
                  <td>{v.purpose}</td>
                  <td>{v.host}</td>
                  <td>{fmt(v.signed_in_at, "date")}</td>
                  <td>{fmt(v.signed_in_at, "time")}</td>
                  <td>{v.signed_out_at ? fmt(v.signed_out_at, "time") : <span className="badge">On Site</span>}</td>
                  <td>{dur(v.signed_in_at, v.signed_out_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {visitors.length === 0 && (
          <p style={{ marginTop: 24, textAlign: "center", color: "#888" }}>No records found.</p>
        )}
        <script dangerouslySetInnerHTML={{ __html: "document.querySelector('.print-btn').addEventListener('click',()=>window.print())" }} />
      </body>
    </html>
  );
}
