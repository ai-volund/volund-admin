import { createAuthClient } from "better-auth/react";
import { genericOAuthClient } from "better-auth/client/plugins";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_AUTH_URL || "http://localhost:3456",
  plugins: [genericOAuthClient(), adminClient()],
});

export const {
  useSession,
  signIn,
  signUp,
  signOut,
} = authClient;
