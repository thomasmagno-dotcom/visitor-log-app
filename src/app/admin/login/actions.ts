"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signToken, COOKIE, MAX_AGE } from "@/lib/session";

export async function login(formData: FormData) {
  const password = (formData.get("password") as string) ?? "";
  const from = (formData.get("from") as string) || "/admin/hosts";

  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: "Incorrect password." };
  }

  const token = await signToken(`admin:${Date.now()}`);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });

  redirect(from);
}

export async function logout() {
  const jar = await cookies();
  jar.delete(COOKIE);
  redirect("/");
}
