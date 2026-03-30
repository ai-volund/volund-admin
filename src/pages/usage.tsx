import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import type { UsageSummary, UsageBreakdown, QuotaStatus } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/stat-card";
import { Zap, Activity, DollarSign, Gauge } from "lucide-react";

export function UsagePage() {
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [breakdown, setBreakdown] = useState<UsageBreakdown | null>(null);
  const [quota, setQuota] = useState<QuotaStatus | null>(null);

  useEffect(() => {
    adminApi.getUsageSummary().then(setSummary).catch(() => {});
    adminApi.getUsageBreakdown().then(setBreakdown).catch(() => {});
    adminApi.getQuotaStatus().then(setQuota).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Usage</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Token usage, costs, and quota status
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Requests"
          value={summary?.total_requests ?? 0}
          icon={Activity}
        />
        <StatCard
          title="Input Tokens"
          value={fmt(summary?.total_input_tokens ?? 0)}
          icon={Zap}
        />
        <StatCard
          title="Output Tokens"
          value={fmt(summary?.total_output_tokens ?? 0)}
          icon={Zap}
        />
      </div>

      {/* By Model Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Breakdown by Model
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!breakdown?.by_model?.length ? (
            <p className="text-sm text-muted-foreground">No usage data yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Provider</th>
                    <th className="pb-2 font-medium">Model</th>
                    <th className="pb-2 font-medium text-right">Requests</th>
                    <th className="pb-2 font-medium text-right">Input</th>
                    <th className="pb-2 font-medium text-right">Output</th>
                    <th className="pb-2 font-medium text-right">Est. Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {breakdown.by_model.map((m) => (
                    <tr key={`${m.provider}-${m.model}`}>
                      <td className="py-2">{m.provider}</td>
                      <td className="py-2">{m.model}</td>
                      <td className="py-2 text-right">{m.requests}</td>
                      <td className="py-2 text-right">{fmt(m.input_tokens)}</td>
                      <td className="py-2 text-right">{fmt(m.output_tokens)}</td>
                      <td className="py-2 text-right">
                        ${m.estimated_cost?.toFixed(4) ?? "0.0000"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quota Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Gauge className="h-4 w-4" /> Quota Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!quota ? (
            <p className="text-sm text-muted-foreground">No quota data</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Plan:</span>
                <Badge>{quota.plan}</Badge>
              </div>
              {Object.entries(quota.limits ?? {}).map(([key, limit]) => {
                const used = quota.usage?.[key] ?? 0;
                const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{key}</span>
                      <span className="text-muted-foreground">
                        {fmt(used)} / {fmt(limit)}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
