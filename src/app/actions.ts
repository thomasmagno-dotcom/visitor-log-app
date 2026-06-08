"use server";

import { getDb, PHOTOS_DIR } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

export async function signIn(formData: FormData) {
  const name    = (formData.get("name")    as string).trim();
  const company = (formData.get("company") as string).trim();
  const purpose = (formData.get("purpose") as string).trim();
  const host    = (formData.get("host")    as string).trim();
  const photoB64 = formData.get("photo") as string | null;

  if (!name || !company || !purpose || !host) {
    throw new Error("All fields are required.");
  }
  if (!photoB64) {
    throw new Error("A visitor photo is required.");
  }

  // Strip data URI prefix and write JPEG to disk
  const base64Data = photoB64.replace(/^data:image\/\w+;base64,/, "");
  const filename = `${uuidv4()}.jpg`;
  fs.writeFileSync(path.join(PHOTOS_DIR, filename), Buffer.from(base64Data, "base64"));

  const db = getDb();
  db.prepare(
    "INSERT INTO visitors (name, company, purpose, host, photo, signed_in_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(name, company, purpose, host, filename, new Date().toISOString());

  revalidatePath("/");
  revalidatePath("/log");
}

export async function signOut(id: number) {
  const db = getDb();
  db.prepare("UPDATE visitors SET signed_out_at = ? WHERE id = ? AND signed_out_at IS NULL")
    .run(new Date().toISOString(), id);
  revalidatePath("/log");
}
