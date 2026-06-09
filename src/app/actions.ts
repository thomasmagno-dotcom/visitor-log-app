"use server";

import { getDb, initDb } from "@/lib/db";
import { sendVisitorNotification } from "@/lib/email";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { put } from "@vercel/blob";

export async function signIn(formData: FormData) {
  const name     = (formData.get("name")    as string).trim();
  const company  = (formData.get("company") as string).trim();
  const purpose  = (formData.get("purpose") as string).trim();
  const host     = (formData.get("host")    as string).trim();
  const email    = (formData.get("email")   as string).trim();
  const phone    = (formData.get("phone")   as string).trim();
  const photoB64 = formData.get("photo") as string | null;

  if (!name || !company || !purpose || !host || !email || !phone) {
    throw new Error("All fields are required.");
  }
  if (!photoB64) {
    throw new Error("A visitor photo is required.");
  }

  // Upload photo to Vercel Blob
  const base64Data = photoB64.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  const filename = `visitor-photos/${uuidv4()}.jpg`;
  const blob = await put(filename, buffer, {
    access: "public",
    contentType: "image/jpeg",
  });

  await initDb();
  const db = getDb();
  const signedInAt = new Date().toISOString();

  await db.execute({
    sql: "INSERT INTO visitors (name, company, purpose, host, email, phone, photo, signed_in_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    args: [name, company, purpose, host, email, phone, blob.url, signedInAt],
  });

  // Look up host and send notification (non-blocking)
  const hostResult = await db.execute({
    sql: "SELECT name, email FROM hosts WHERE name = ? AND active = 1",
    args: [host],
  });
  const hostRecord = hostResult.rows[0] as unknown as { name: string; email: string | null } | undefined;

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
  await initDb();
  const db = getDb();
  await db.execute({
    sql: "UPDATE visitors SET signed_out_at = ? WHERE id = ? AND signed_out_at IS NULL",
    args: [new Date().toISOString(), id],
  });
  revalidatePath("/log");
}

export async function searchSignedIn(query: string) {
  await initDb();
  const db = getDb();
  const like = `%${query}%`;
  const result = await db.execute({
    sql: `SELECT id, name, company, host, signed_in_at FROM visitors
          WHERE signed_out_at IS NULL AND name LIKE ?
          ORDER BY signed_in_at DESC LIMIT 10`,
    args: [like],
  });
  return result.rows as unknown as { id: number; name: string; company: string; host: string; signed_in_at: string }[];
}

export async function selfSignOut(id: number) {
  await initDb();
  const db = getDb();
  await db.execute({
    sql: "UPDATE visitors SET signed_out_at = ? WHERE id = ? AND signed_out_at IS NULL",
    args: [new Date().toISOString(), id],
  });
  revalidatePath("/log");
  revalidatePath("/");
}
