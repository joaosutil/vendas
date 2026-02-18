import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { AccountSettings } from "@/components/account/account-settings";

export default async function AccountPage() {
  const user = await requireUser();
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      email: true,
      avatarUrl: true,
      alertsEnabled: true,
    },
  });

  if (!fullUser) return null;
  return <AccountSettings user={fullUser} />;
}
