"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { endSession } from "@/server/auth/session";

export async function signOutAction() {
  await endSession(await headers());
  redirect("/login");
}
