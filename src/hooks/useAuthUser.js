import { useEffect, useState } from "react";

const STORAGE_KEY = "authUser";
const EVENT_NAME = "auth:user";

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function notifyAuthUserChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function useAuthUser() {
  const [user, setUser] = useState(getStoredUser());

  useEffect(() => {
    const handleUpdate = () => setUser(getStoredUser());

    window.addEventListener("storage", handleUpdate);
    window.addEventListener(EVENT_NAME, handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener(EVENT_NAME, handleUpdate);
    };
  }, []);

  return user;
}

export function getUserDisplayName(user) {
  if (!user) return;
  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return name || user.email || "Guest";
}
