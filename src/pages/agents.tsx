import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import type { AgentProfile } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Bot } from "lucide-react";

export function AgentsPage() {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", model_provider: "openai", model_id: "gpt-4o", profile_type: "specialist" });

  useEffect(() => {
    adminApi.listAgents().then((d) => setAgents(d.agents)).catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    try {
      const agent = await adminApi.createSystemAgent(form);
      setAgents((prev) => [...prev, agent]);
      setForm({ name: "", model_provider: "openai", model_id: "gpt-4o", profile_type: "specialist" });
      setShowCreate(false);
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this agent profile?")) return;
    try {
      await adminApi.deleteAgent(id);
      setAgents((prev) => prev.filter((a) => a.id !== id));
    } catch { /* ignore */ }
  };

  const systemAgents = agents.filter((a) => a.visibility === "system");
  const userAgents = agents.filter((a) => a.visibility !== "system");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agents</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage system and user agent profiles
          </p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> System Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create System Agent</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input placeholder="Agent name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Provider (openai)" value={form.model_provider} onChange={(e) => setForm({ ...form, model_provider: e.target.value })} />
              <Input placeholder="Model (gpt-4o)" value={form.model_id} onChange={(e) => setForm({ ...form, model_id: e.target.value })} />
              <Button onClick={handleCreate} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* System Agents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-4 w-4" /> System Agents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {systemAgents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No system agents</p>
          ) : (
            <AgentTable agents={systemAgents} onDelete={handleDelete} />
          )}
        </CardContent>
      </Card>

      {/* User Agents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">User Agents</CardTitle>
        </CardHeader>
        <CardContent>
          {userAgents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No user-created agents</p>
          ) : (
            <AgentTable agents={userAgents} onDelete={handleDelete} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AgentTable({ agents, onDelete }: { agents: AgentProfile[]; onDelete: (id: string) => void }) {
  return (
    <div className="divide-y">
      {agents.map((a) => (
        <div key={a.id} className="flex items-center justify-between py-3">
          <div className="min-w-0">
            <p className="text-sm font-medium">{a.name}</p>
            <p className="text-xs text-muted-foreground">
              {a.model_provider}/{a.model_id} · {a.profile_type}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline">{a.skills?.length ?? 0} skills</Badge>
            <Button variant="ghost" size="sm" onClick={() => onDelete(a.id)}>
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
