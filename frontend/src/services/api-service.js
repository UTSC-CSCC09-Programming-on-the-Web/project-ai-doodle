const API_BASE = "http://localhost:3000/api";

export async function getCurrentUser() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

export async function logout() {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Logout failed");
  return res.json();
}

export function getGoogleLoginUrl() {
  return `${API_BASE}/auth/google`;
}

export async function createStripeCheckout() {
  const res = await fetch(`${API_BASE}/stripe/checkout`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to create Stripe session");
  return res.json();
}
