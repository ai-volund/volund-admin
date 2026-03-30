import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import type { Instance, WarmPoolStats } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/stat-card";
import { Cpu, Server, Trash2, RefreshCw } from "lucide-react";

const stateColor: Record<string, "default" | "outline" | "destructive"> = {
  active: "default",
  warm: "outline",
  cold: "destructive",
};

export function InstancesPage() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [stats, setStats] = useState<WarmPoolStats | null>(null);

  const load = () => {
    adminApi.listInstances().then((d) => setInstances(d.instances ?? [])).catch(() => {});
    adminApi.getWarmPoolStats().then(setStats).catch(() => {});
  };

  useEffect(load, []);

  const handleRelease = async (id: string) => {
    if (!confirm("Force-release this instance?")) return;
    await adminApi.forceReleaseInstance(id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agent Instances</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Live agent pods and warm pool status
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Warm Pool Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Pods" value={stats.total} icon={Server} />
          <StatCard title="Available" value={stats.available} subtitle="warm, ready to claim" icon={Cpu} />
          <StatCard title="Claimed" value={stats.claimed} subtitle="assigned to tenants" icon={Cpu} />
          <StatCard title="Active" value={stats.active} subtitle="processing requests" icon={Cpu} />
        </div>
      )}

      {/* Instance List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Instances</CardTitle>
        </CardHeader>
        <CardContent>
          {instances.length === 0 ? (
            <p className="text-sm text-muted-foreground">No agent instances running</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Pod</th>
                    <th className="pb-2 font-medium">State</th>
                    <th className="pb-2 font-medium">Tenant</th>
                    <th className="pb-2 font-medium">Profile</th>
                    <th className="pb-2 font-medium">Last Heartbeat</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {instances.map((inst) => (
                    <tr key={inst.id}>
                      <td className="py-2 font-mono text-xs">{inst.pod_name ?? "—"}</td>
                      <td className="py-2">
                        <Badge variant={stateColor[inst.state] ?? "outline"}>{inst.state}</Badge>
                      </td>
                      <td className="py-2 font-mono text-xs">{inst.tenant_id?.slice(0, 8) ?? "—"}</td>
                      <td className="py-2 font-mono text-xs">{inst.profile_id?.slice(0, 8) ?? "—"}</td>
                      <td className="py-2 text-xs text-muted-foreground">
                        {inst.last_heartbeat ? new Date(inst.last_heartbeat).toLocaleTimeString() : "—"}
                      </td>
                      <td className="py-2">
                        {inst.state === "active" && (
                          <Button variant="ghost" size="sm" onClick={() => handleRelease(inst.id)}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
