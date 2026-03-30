import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import type { AuditEntry } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollText, RefreshCw } from "lucide-react";

export function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);

  const load = () => {
    adminApi.listAudit(200).then((d) => setEntries(d.entries ?? [])).catch(() => {});
  };

  useEffect(load, []);

  const methodColor = (action: string): "default" | "outline" | "destructive" => {
    if (action.startsWith("DELETE")) return "destructive";
    if (action.startsWith("POST") || action.startsWith("PUT")) return "default";
    return "outline";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Log</h1>
          <p className="text-muted-foreground text-sm mt-1">
            All administrative actions on the platform
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ScrollText className="h-4 w-4" /> Recent Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No audit entries yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Time</th>
                    <th className="pb-2 font-medium">Action</th>
                    <th className="pb-2 font-medium">Resource</th>
                    <th className="pb-2 font-medium">User</th>
                    <th className="pb-2 font-medium">Tenant</th>
                    <th className="pb-2 font-medium">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {entries.map((e) => (
                    <tr key={e.id}>
                      <td className="py-2 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(e.created_at).toLocaleString()}
                      </td>
                      <td className="py-2">
                        <Badge variant={methodColor(e.action)} className="text-xs font-mono">
                          {e.action}
                        </Badge>
                      </td>
                      <td className="py-2 text-xs">
                        {e.resource}{e.resource_id ? ` / ${e.resource_id.slice(0, 8)}` : ""}
                      </td>
                      <td className="py-2 font-mono text-xs">{e.user_id?.slice(0, 8) ?? "—"}</td>
                      <td className="py-2 font-mono text-xs">{e.tenant_id?.slice(0, 8) ?? "—"}</td>
                      <td className="py-2 text-xs text-muted-foreground">{e.ip_address || "—"}</td>
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
