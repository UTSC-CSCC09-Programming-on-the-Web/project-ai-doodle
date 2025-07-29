const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

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

export async function createRoom(roomData) {
  const res = await fetch(`${API_BASE}/rooms`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(roomData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Room creation failed");
  }
  return await res.json();
}

export async function getRoomById(id) {
  const res = await fetch(`${API_BASE}/rooms/${id}`, {
    credentials: "include",
  });
  if (res.status === 403) {
    throw new Error("Not authenticated to view this room");
  } else if (res.status === 404) {
    throw new Error("Room not found");
  }
  if (!res.ok) throw new Error("Failed to fetch room");
  return res.json();
}

export async function joinRoomByName(name, passcode) {
  const res = await fetch(`${API_BASE}/rooms/join`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, passcode }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to join room");

  return data.room;
}

export async function deleteRoom(roomId) {
  const res = await fetch(`${API_BASE}/rooms/${roomId}`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to delete room");
  }

  return res.json();
}
