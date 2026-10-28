// Stored user records can be incomplete after manual localStorage edits or a
// partial migration. Ignore invalid usernames so one bad record cannot crash
// every login attempt.
export function findUserByUsername(users, username) {
  const value = String(username || "")
    .trim()
    .toLowerCase();
  return users.find(
    (user) =>
      typeof user?.username === "string" &&
      user.username.trim().toLowerCase() === value,
  );
}
