"use server";

import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addHost(formData: FormData) {
  const name = (formData.get("name") as string).trim();
  const title = (formData.get("title") as string | null)?.trim() || null;
  if (!name) throw new Error("Name is required.");
  const db = getDb();
  db.prepare("INSERT INTO hosts (name, title) VALUES (?, ?)").run(name, title);
  revalidatePath("/admin/hosts");
  revalidatePath("/");
}

export async function updateHost(formData: FormData) {
  const id = Number(formData.get("id"));
  const name = (formData.get("name") as string).trim();
  const title = (formData.get("title") as string | null)?.trim() || null;
  if (!name) throw new Error("Name is required.");
  const db = getDb();
  db.prepare("UPDATE hosts SET name = ?, title = ? WHERE id = ?").run(name, title, id);
  revalidatePath("/admin/hosts");
  revalidatePath("/");
}

export async function toggleHost(id: number, active: boolean) {
  const db = getDb();
  db.prepare("UPDATE hosts SET active = ? WHERE id = ?").run(active ? 1 : 0, id);
  revalidatePath("/admin/hosts");
  revalidatePath("/");
}

export async function deleteHost(id: number) {
  const db = getDb();
  db.prepare("DELETE FROM hosts WHERE id = ?").run(id);
  revalidatePath("/admin/hosts");
  revalidatePath("/");
}
