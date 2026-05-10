export type AuthUser = {
  displayName: string | null;
  email: string | null;
  uid: string;
};

export function getUserInitials(user: Pick<AuthUser, "displayName" | "email"> | null): string {
  const source = user?.displayName || user?.email || "";
  const emailName = source.split("@")[0] || "";
  const parts = emailName
    .replace(/[._-]+/g, " ")
    .split(" ")
    .map(part => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return (parts[0]?.slice(0, 2) || "PB").toUpperCase();
}
