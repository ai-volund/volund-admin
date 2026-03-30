import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import type { Provider } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link, Trash2, Key } from "lucide-react";

export function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [configuring, setConfiguring] = useState<string | null>(null);
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    adminApi.listProviders().then((d) => setProviders(d.providers)).catch(() => {});
  }, []);

  const handleConfigure = async () => {
    if (!configuring || !clientId || !clientSecret) return;
    try {
      await adminApi.setProviderCredentials(configuring, {
        client_id: clientId,
        client_secret: clientSecret,
      });
      setProviders((prev) =>
        prev.map((p) =>
          p.id === configuring ? { ...p, configured: true } : p
        )
      );
      setConfiguring(null);
      setClientId("");
      setClientSecret("");
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this provider configuration?")) return;
    try {
      await adminApi.deleteProvider(id);
      setProviders((prev) =>
        prev.map((p) => (p.id === id ? { ...p, configured: false } : p))
      );
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Providers</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage OAuth provider credentials for service connections
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Link className="h-4 w-4" /> OAuth Providers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {providers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No providers registered. Providers are registered by skill manifests.
            </p>
          ) : (
            <div className="divide-y">
              {providers.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{p.display_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.category} · {p.scopes?.join(", ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={p.configured ? "default" : "outline"}>
                      {p.configured ? "configured" : "unconfigured"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfiguring(p.id)}
                    >
                      <Key className="h-3 w-3 mr-1" /> Configure
                    </Button>
                    {p.configured && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(p.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configure Dialog */}
      <Dialog open={!!configuring} onOpenChange={() => setConfiguring(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Configure {providers.find((p) => p.id === configuring)?.display_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Client ID"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Client Secret"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
            />
            <Button onClick={handleConfigure} className="w-full">
              Save Credentials
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
