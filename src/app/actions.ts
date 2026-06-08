"use server";

import { getDb, PHOTOS_DIR } from "@/lib/db";
import { sendVisitorNotification } from "@/lib/email";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

export async function signIn(formData: FormData) {
  const name     = (formData.get("name")    as string).trim();
  const company  = (formData.get("company") as string).trim();
  const purpose  = (formData.get("purpose") as string).trim();
  const host     = (formData.get("host")    as string).trim();
  const photoB64 = formData.get("photo") as string | null;

  if (!name || !company || !purpose || !host) {
    throw new Error("All fields are required.");
  }
  if (!photoB64) {
    throw new Error("A visitor photo is required.");
  }

  const base64Data = photoB64.replace(/^data:image\/\w+;base64,/, "");
  const filename = `${uuidv4()}.jpg`;
  fs.writeFileSync(path.join(PHOTOS_DIR, filename), Buffer.from(base64Data, "base64"));

  const db = getDb();
  const signedInAt = new Date().toISOString();

  db.prepare(
    "INSERT INTO visitors (name, company, purpose, host, photo, signed_in_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(name, company, purpose, host, filename, signedInAt);

  // Look up host email and send notification (non-blocking — don't fail sign-in if email fails)
  const hostRecord = db
    .prepare("SELECT name, email FROM hosts WHERE name = ? AND active = 1")
    .get(host) as { name: string; email: string | null } | undefined;

  if (hostRecord?.email) {
    sendVisitorNotification(
      { name: hostRecord.name, email: hostRecord.email },
      { name, company, purpose, signedInAt }
    ).catch((err) => console.error("[email] Failed to send notification:", err));
  }

  revalidatePath("/");
  revalidatePath("/log");
}

export async function signOut(id: number) {
  const db = getDb();
  db.prepare("UPDATE visitors SET signed_out_at = ? WHERE id = ? AND signed_out_at IS NULL")
    .run(new Date().toISOString(), id);
  revalidatePath("/log");
}

export async function searchSignedIn(query: string) {
  const db = getDb();
  const like = `%${query}%`;
  return db
    .prepare(
      `SELECT id, name, company, host, signed_in_at FROM visitors
       WHERE signed_out_at IS NULL AND name LIKE ?
       ORDER BY signed_in_at DESC LIMIT 10`
    )
    .all(like) as { id: number; name: string; company: string; host: string; signed_in_at: string }[];
}

export async function selfSignOut(id: number) {
  const db = getDb();
  db.prepare("UPDATE visitors SET signed_out_at = ? WHERE id = ? AND signed_out_at IS NULL")
    .run(new Date().toISOString(), id);
  revalidatePath("/log");
  revalidatePath("/");
}
