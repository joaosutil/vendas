type BasicUser = {
  role?: "USER" | "ADMIN" | string;
  email: string;
};

function normalizeEmailList(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminUser(user: BasicUser) {
  if (user.role === "ADMIN") return true;
  const adminEmails = normalizeEmailList(process.env.ADMIN_EMAILS);
  return adminEmails.includes(user.email.toLowerCase());
}
