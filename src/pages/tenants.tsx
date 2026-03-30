import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import type { Tenant, Member } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Users, ChevronRight, Trash2 } from "lucide-react";

export function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    adminApi.listTenants().then((d) => setTenants(d.tenants)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selected) {
      adminApi.listMembers(selected).then((d) => setMembers(d.members)).catch(() => setMembers([]));
    }
  }, [selected]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const tenant = await adminApi.createTenant({ name: newName });
      setTenants((prev) => [...prev, tenant]);
      setNewName("");
      setShowCreate(false);
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this tenant? This cannot be undone.")) return;
    try {
      await adminApi.deleteTenant(id);
      setTenants((prev) => prev.filter((t) => t.id !== id));
      if (selected === id) setSelected(null);
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tenants</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage organizations and their members
          </p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Create Tenant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Tenant</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Organization name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <Button onClick={handleCreate} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tenant List */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              {tenants.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">No tenants</p>
              ) : (
                <div className="divide-y">
                  {tenants.map((t) => (
                    <div
                      key={t.id}
                      className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors ${selected === t.id ? "bg-muted/50" : ""}`}
                      onClick={() => setSelected(t.id)}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.slug}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline">{t.plan}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Member Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-4 w-4" />
                Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selected ? (
                <p className="text-sm text-muted-foreground">Select a tenant</p>
              ) : members.length === 0 ? (
                <p className="text-sm text-muted-foreground">No members</p>
              ) : (
                <div className="space-y-2">
                  {members.map((m) => (
                    <div key={m.id} className="py-2 border-b last:border-0">
                      <p className="text-sm font-medium">{m.display_name}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
