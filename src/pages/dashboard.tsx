import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import type { Tenant, UsageSummary } from "@/lib/admin-api";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Bot, Zap, Activity } from "lucide-react";

export function DashboardPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [health, setHealth] = useState<{ status: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.allSettled([
      adminApi.listTenants().then((d) => setTenants(d.tenants)),
      adminApi.getUsageSummary().then(setUsage),
      adminApi.healthCheck().then(setHealth),
    ]).then((results) => {
      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length === results.length) setError("Failed to load dashboard data");
    });
  }, []);

  if (error) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{error}</p>
        <p className="text-sm mt-2">Make sure the gateway is running and you have admin access.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Platform overview and health status
        </p>
      </div>

      {/* Health */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Gateway:</span>
        <Badge variant={health?.status === "ok" ? "default" : "destructive"}>
          {health?.status ?? "checking..."}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tenants"
          value={tenants.length}
          icon={Building2}
        />
        <StatCard
          title="Total Requests"
          value={usage?.total_requests ?? 0}
          icon={Activity}
        />
        <StatCard
          title="Input Tokens"
          value={formatNumber(usage?.total_input_tokens ?? 0)}
          icon={Zap}
        />
        <StatCard
          title="Output Tokens"
          value={formatNumber(usage?.total_output_tokens ?? 0)}
          icon={Bot}
        />
      </div>

      {/* Recent Tenants */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tenants</CardTitle>
        </CardHeader>
        <CardContent>
          {tenants.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tenants yet</p>
          ) : (
            <div className="space-y-2">
              {tenants.slice(0, 10).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.slug}</p>
                  </div>
                  <Badge variant="outline">{t.plan}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage by Model */}
      {usage?.by_model && usage.by_model.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Usage by Model</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {usage.by_model.map((m) => (
                <div
                  key={`${m.provider}-${m.model}`}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{m.model}</p>
                    <p className="text-xs text-muted-foreground">{m.provider}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p>{m.requests} requests</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(m.input_tokens + m.output_tokens)} tokens
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
