import { redirect } from "next/navigation";
import { requireUser } from "@/lib/require-user";
import { isAdminUser } from "@/lib/is-admin-user";

export async function requireAdmin() {
  const user = await requireUser();
  if (!isAdminUser(user)) redirect("/app");
  return user;
}
