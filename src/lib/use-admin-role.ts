import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

const ADMIN_ROLES = ["platform_admin", "admin", "owner"];
const AUTH_URL = import.meta.env.VITE_AUTH_URL || "http://localhost:3456";

interface AdminRoleState {
  role: string | null;
  isAdmin: boolean;
  isPending: boolean;
}

/**
 * Fetches the JWT from better-auth and extracts the role claim.
 * Returns whether the current user has admin access.
 */
export function useAdminRole(): AdminRoleState {
  const { data: session } = useSession();
  const [role, setRole] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    if (!session) {
      setIsPending(false);
      return;
    }

    fetch(`${AUTH_URL}/api/auth/token`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("no token");
        return res.json();
      })
      .then((data) => {
        // Decode JWT payload (middle segment)
        const payload = JSON.parse(atob(data.token.split(".")[1]));
        setRole(payload.role ?? null);
      })
      .catch(() => setRole(null))
      .finally(() => setIsPending(false));
  }, [session]);

  return {
    role,
    isAdmin: role !== null && ADMIN_ROLES.includes(role),
    isPending,
  };
}
