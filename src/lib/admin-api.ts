/**
 * Admin API client — wraps gateway REST API calls with JWT auth.
 * The JWT is obtained from better-auth's /token endpoint.
 */

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || "";
const AUTH_URL = import.meta.env.VITE_AUTH_URL || "http://localhost:3456";

class AdminAPI {
  private jwt: string | null = null;
  private jwtExpiry = 0;

  /** Fetch a fresh JWT from better-auth using the session cookie. */
  private async refreshJWT(): Promise<string> {
    const res = await fetch(`${AUTH_URL}/api/auth/token`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Not authenticated");
    const data = await res.json();
    this.jwt = data.token;
    // JWT expires in 15m, refresh at 12m
    this.jwtExpiry = Date.now() + 12 * 60 * 1000;
    return this.jwt!;
  }

  private async getToken(): Promise<string> {
    if (this.jwt && Date.now() < this.jwtExpiry) return this.jwt;
    return this.refreshJWT();
  }

  private async headers(): Promise<HeadersInit> {
    const token = await this.getToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  private async get<T>(path: string): Promise<T> {
    const res = await fetch(`${GATEWAY_URL}${path}`, {
      headers: await this.headers(),
    });
    if (!res.ok) throw new Error(`GET ${path}: ${res.status}`);
    return res.json();
  }

  private async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${GATEWAY_URL}${path}`, {
      method: "POST",
      headers: await this.headers(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`POST ${path}: ${res.status}`);
    return res.json();
  }

  private async put<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${GATEWAY_URL}${path}`, {
      method: "PUT",
      headers: await this.headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`PUT ${path}: ${res.status}`);
    return res.json();
  }

  private async del(path: string): Promise<void> {
    const res = await fetch(`${GATEWAY_URL}${path}`, {
      method: "DELETE",
      headers: await this.headers(),
    });
    if (!res.ok) throw new Error(`DELETE ${path}: ${res.status}`);
  }

  // ── Tenants ───────────────────────────────────────────────────────────────

  async listTenants() {
    return this.get<{ tenants: Tenant[] }>("/v1/tenants");
  }

  async getTenant(id: string) {
    return this.get<Tenant>(`/v1/tenants/${id}`);
  }

  async createTenant(data: { name: string; slug?: string; plan?: string }) {
    return this.post<Tenant>("/v1/tenants", data);
  }

  async updateTenant(id: string, data: { name?: string; plan?: string }) {
    return this.put<Tenant>(`/v1/tenants/${id}`, data);
  }

  async deleteTenant(id: string) {
    return this.del(`/v1/tenants/${id}`);
  }

  async listMembers(tenantId: string) {
    return this.get<{ members: Member[] }>(`/v1/tenants/${tenantId}/members`);
  }

  // ── Agents ────────────────────────────────────────────────────────────────

  async listAgents() {
    return this.get<{ agents: AgentProfile[] }>("/v1/agents");
  }

  async createSystemAgent(profile: Partial<AgentProfile>) {
    return this.post<AgentProfile>("/v1/admin/agents", profile);
  }

  async updateAgent(id: string, data: Partial<AgentProfile>) {
    return this.put<AgentProfile>(`/v1/agents/${id}`, data);
  }

  async deleteAgent(id: string) {
    return this.del(`/v1/agents/${id}`);
  }

  // ── Skills ────────────────────────────────────────────────────────────────

  async listInstalledSkills() {
    return this.get<{ skills: Skill[] }>("/v1/admin/skills/installed");
  }

  async listAvailableSkills() {
    return this.get<{ skills: Skill[] }>("/v1/skills");
  }

  async installSkill(id: string) {
    return this.post(`/v1/admin/skills/${id}/install`);
  }

  async uninstallSkill(id: string) {
    return this.del(`/v1/admin/skills/${id}/install`);
  }

  async searchForgeSkills(params?: { q?: string; type?: string }) {
    const query = new URLSearchParams();
    if (params?.q) query.set("q", params.q);
    if (params?.type) query.set("type", params.type);
    return this.get<{ skills: ForgeSkill[] }>(`/v1/forge/skills?${query}`);
  }

  // ── Providers ─────────────────────────────────────────────────────────────

  async listProviders() {
    return this.get<{ providers: Provider[] }>("/v1/admin/providers");
  }

  async setProviderCredentials(
    id: string,
    data: { client_id: string; client_secret: string }
  ) {
    return this.put(`/v1/admin/providers/${id}/credentials`, data);
  }

  async deleteProvider(id: string) {
    return this.del(`/v1/admin/providers/${id}`);
  }

  // ── Usage ─────────────────────────────────────────────────────────────────

  async getUsageSummary(from?: string, to?: string) {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return this.get<UsageSummary>(`/v1/usage/summary?${params}`);
  }

  async getUsageBreakdown() {
    return this.get<UsageBreakdown>("/v1/usage/breakdown");
  }

  async getQuotaStatus() {
    return this.get<QuotaStatus>("/v1/usage/quota");
  }

  // ── Health ────────────────────────────────────────────────────────────────

  async healthCheck() {
    const res = await fetch(`${GATEWAY_URL}/healthz`);
    return res.json();
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  created_at: string;
}

export interface Member {
  id: string;
  email: string;
  display_name: string;
}

export interface AgentProfile {
  id: string;
  tenant_id: string;
  name: string;
  profile_type: string;
  system_prompt: string;
  model_provider: string;
  model_id: string;
  temperature: number;
  max_tokens: number;
  skills: string[];
  visibility?: string;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  version: string;
  type: string;
  description: string;
  enabled?: boolean;
}

export interface ForgeSkill {
  name: string;
  version: string;
  type: string;
  description: string;
  author: string;
  tags: string[];
  downloads: number;
}

export interface Provider {
  id: string;
  display_name: string;
  category: string;
  configured: boolean;
  scopes: string[];
}

export interface UsageSummary {
  total_input_tokens: number;
  total_output_tokens: number;
  total_requests: number;
  by_model?: {
    provider: string;
    model: string;
    input_tokens: number;
    output_tokens: number;
    requests: number;
  }[];
}

export interface UsageBreakdown {
  by_model: {
    provider: string;
    model: string;
    input_tokens: number;
    output_tokens: number;
    requests: number;
    estimated_cost: number;
  }[];
}

export interface QuotaStatus {
  tenant_id: string;
  plan: string;
  limits: Record<string, number>;
  usage: Record<string, number>;
}

export const adminApi = new AdminAPI();
