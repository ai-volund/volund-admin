import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, TestTube, Brain, Check, X, Loader2, Server } from "lucide-react";

interface LLMProvider {
  id: string;
  name: string;
  type: string;
  api_key: string;
  base_url: string;
  enabled: boolean;
  priority: number;
  created_at: string;
}

const PROVIDER_TYPES = [
  { value: "openai", label: "OpenAI", placeholder: "https://api.openai.com/v1" },
  { value: "anthropic", label: "Anthropic", placeholder: "https://api.anthropic.com" },
  { value: "ollama", label: "Ollama", placeholder: "http://localhost:11434" },
  { value: "openai-compatible", label: "OpenAI Compatible", placeholder: "https://api.example.com/v1" },
];

export function LLMProvidersPage() {
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; status: string; models?: string[]; error?: string } | null>(null);
  const [form, setForm] = useState({
    name: "",
    type: "openai",
    api_key: "",
    base_url: "",
    priority: 0,
  });

  const load = () => {
    adminApi.listLLMProviders().then((d) => setProviders(d.providers ?? [])).catch(() => {});
    adminApi.listLLMModels().then((d) => {
      const m = (d.models as { id: string }[]) ?? [];
      setModels(m.map((x) => x.id ?? (x as unknown as string)));
    }).catch(() => {});
  };

  useEffect(load, []);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.type) return;
    try {
      await adminApi.createLLMProvider(form);
      setForm({ name: "", type: "openai", api_key: "", base_url: "", priority: 0 });
      setShowCreate(false);
      load();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this LLM provider?")) return;
    try {
      await adminApi.deleteLLMProvider(id);
      load();
    } catch { /* ignore */ }
  };

  const handleTest = async (id: string) => {
    setTesting(id);
    setTestResult(null);
    try {
      const result = await adminApi.testLLMProvider(id);
      setTestResult({ id, ...result });
    } catch (err) {
      setTestResult({ id, status: "error", error: String(err) });
    } finally {
      setTesting(null);
    }
  };

  const handleToggle = async (p: LLMProvider) => {
    try {
      await adminApi.updateLLMProvider(p.id, { enabled: !p.enabled });
      load();
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">LLM Providers</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure AI model providers — OpenAI, Anthropic, Ollama, or any OpenAI-compatible API
          </p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Provider
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add LLM Provider</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Display name (e.g. OpenAI Production)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                {PROVIDER_TYPES.map((t) => (
                  <Button
                    key={t.value}
                    variant={form.type === t.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setForm({ ...form, type: t.value })}
                  >
                    {t.label}
                  </Button>
                ))}
              </div>
              <Input
                type="password"
                placeholder="API Key"
                value={form.api_key}
                onChange={(e) => setForm({ ...form, api_key: e.target.value })}
              />
              <Input
                placeholder={PROVIDER_TYPES.find((t) => t.value === form.type)?.placeholder ?? "Base URL (optional)"}
                value={form.base_url}
                onChange={(e) => setForm({ ...form, base_url: e.target.value })}
              />
              <Button onClick={handleCreate} className="w-full">Add Provider</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Provider List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-4 w-4" /> Configured Providers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {providers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Server className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No LLM providers configured</p>
              <p className="text-xs mt-1">Add a provider to enable AI capabilities</p>
            </div>
          ) : (
            <div className="divide-y">
              {providers.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{p.name}</p>
                      <Badge variant={p.enabled ? "default" : "outline"}>
                        {p.enabled ? "enabled" : "disabled"}
                      </Badge>
                      <Badge variant="outline">{p.type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {p.base_url || "(default endpoint)"} · Key: {p.api_key || "not set"}
                    </p>
                    {testResult?.id === p.id && (
                      <div className="mt-1 flex items-center gap-1">
                        {testResult.status === "ok" ? (
                          <>
                            <Check className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-green-600">
                              Connected — {testResult.models?.length ?? 0} models available
                            </span>
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3 text-destructive" />
                            <span className="text-xs text-destructive">{testResult.error}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={testing === p.id}
                      onClick={() => handleTest(p.id)}
                    >
                      {testing === p.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <TestTube className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(p)}
                    >
                      {p.enabled ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(p.id)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Model Catalog */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Models</CardTitle>
        </CardHeader>
        <CardContent>
          {models.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No models available. Add and enable an LLM provider first.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {models.map((m) => (
                <Badge key={m} variant="outline">{m}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
