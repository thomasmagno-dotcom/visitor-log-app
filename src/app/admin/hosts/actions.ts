"use server";

import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";

function extract(formData: FormData) {
  return {
    name:  (formData.get("name")  as string).trim(),
    title: (formData.get("title") as string | null)?.trim() || null,
    email: (formData.get("email") as string | null)?.trim() || null,
    phone: (formData.get("phone") as string | null)?.trim() || null,
  };
}

export async function addHost(formData: FormData) {
  const { name, title, email, phone } = extract(formData);
  if (!name) throw new Error("Name is required.");
  const db = getDb();
  db.prepare("INSERT INTO hosts (name, title, email, phone) VALUES (?, ?, ?, ?)").run(name, title, email, phone);
  revalidatePath("/admin/hosts");
  revalidatePath("/");
}

export async function updateHost(formData: FormData) {
  const id = Number(formData.get("id"));
  const { name, title, email, phone } = extract(formData);
  if (!name) throw new Error("Name is required.");
  const db = getDb();
  db.prepare("UPDATE hosts SET name = ?, title = ?, email = ?, phone = ? WHERE id = ?").run(name, title, email, phone, id);
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
