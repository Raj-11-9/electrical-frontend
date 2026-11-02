import "server-only";

export async function hasCustomerSession(token?: string): Promise<boolean> {
  if (!token) return false;
  const response = await fetch((process.env.API_URL || "http://127.0.0.1:4000/api") + "/commerce/me", {
    headers: { Authorization: "Bearer " + token },
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  if (response.status === 401 || response.status === 403) return false;
  if (!response.ok) throw new Error("We couldn’t verify your account. Please try again shortly.");
  return true;
}
