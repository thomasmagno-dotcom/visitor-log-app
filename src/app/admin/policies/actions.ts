"use server";

import { getDb, initDb } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updatePolicy(formData: FormData) {
  const id      = Number(formData.get("id"));
  const title   = (formData.get("title") as string).trim();
  const version = (formData.get("version") as string).trim();
  const date    = (formData.get("effective_date") as string).trim();
  const body    = (formData.get("body") as string).trim();

  if (!id || !title || !version || !date || !body) {
    throw new Error("All fields are required.");
  }

  await initDb();
  const db = getDb();
  await db.execute({
    sql: "UPDATE policies SET title=?, version=?, effective_date=?, body=?, updated_at=? WHERE id=?",
    args: [title, version, date, body, new Date().toISOString(), id],
  });

  revalidatePath("/admin/policies");
  revalidatePath("/");
}
