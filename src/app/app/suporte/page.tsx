import { requireUser } from "@/lib/require-user";
import { SupportChat } from "@/components/support/support-chat";

export default async function SupportPage() {
  const user = await requireUser();
  return <SupportChat userEmail={user.email} />;
}
