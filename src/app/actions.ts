"use server";

import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function signIn(formData: FormData) {
  const name = (formData.get("name") as string).trim();
  const company = (formData.get("company") as string).trim();
  const purpose = (formData.get("purpose") as string).trim();
  const host = (formData.get("host") as string).trim();

  if (!name || !company || !purpose || !host) {
    throw new Error("All fields are required.");
  }

  const db = getDb();
  db.prepare(
    "INSERT INTO visitors (name, company, purpose, host, signed_in_at) VALUES (?, ?, ?, ?, ?)"
  ).run(name, company, purpose, host, new Date().toISOString());

  revalidatePath("/");
}
