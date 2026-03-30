import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSession } from "@/lib/auth-client";
import { useAdminRole } from "@/lib/use-admin-role";
import { Login } from "@/components/login";
import { AccessDenied } from "@/components/access-denied";
import { Layout } from "@/components/layout";
import { DashboardPage } from "@/pages/dashboard";
import { TenantsPage } from "@/pages/tenants";
import { AgentsPage } from "@/pages/agents";
import { SkillsPage } from "@/pages/skills";
import { ProvidersPage } from "@/pages/providers";
import { LLMProvidersPage } from "@/pages/llm-providers";
import { UsagePage } from "@/pages/usage";
import { SettingsPage } from "@/pages/settings";

export default function App() {
  const { data: session, isPending: sessionPending } = useSession();
  const { isAdmin, role, isPending: rolePending } = useAdminRole();

  if (sessionPending || rolePending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  if (!isAdmin) {
    return <AccessDenied role={role} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tenants" element={<TenantsPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/providers" element={<ProvidersPage />} />
          <Route path="/llm-providers" element={<LLMProvidersPage />} />
          <Route path="/usage" element={<UsagePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
