import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import type { Skill, ForgeSkill } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Trash2, Search, Puzzle } from "lucide-react";

export function SkillsPage() {
  const [installed, setInstalled] = useState<Skill[]>([]);
  const [available, setAvailable] = useState<Skill[]>([]);
  const [forgeSkills, setForgeSkills] = useState<ForgeSkill[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminApi.listInstalledSkills().then((d) => setInstalled(d.skills)).catch(() => {});
    adminApi.listAvailableSkills().then((d) => setAvailable(d.skills)).catch(() => {});
  }, []);

  const handleSearch = async () => {
    const d = await adminApi.searchForgeSkills({ q: search });
    setForgeSkills(d.skills);
  };

  const handleInstall = async (id: string) => {
    try {
      await adminApi.installSkill(id);
      const d = await adminApi.listInstalledSkills();
      setInstalled(d.skills);
    } catch { /* ignore */ }
  };

  const handleUninstall = async (id: string) => {
    try {
      await adminApi.uninstallSkill(id);
      setInstalled((prev) => prev.filter((s) => s.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Skills</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Install and manage skills for the platform
        </p>
      </div>

      {/* Installed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Puzzle className="h-4 w-4" /> Installed Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          {installed.length === 0 ? (
            <p className="text-sm text-muted-foreground">No skills installed</p>
          ) : (
            <div className="divide-y">
              {installed.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.type} · v{s.version}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleUninstall(s.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Skills</CardTitle>
        </CardHeader>
        <CardContent>
          {available.length === 0 ? (
            <p className="text-sm text-muted-foreground">No skills available</p>
          ) : (
            <div className="divide-y">
              {available.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.description}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleInstall(s.id)}>
                    <Download className="h-3 w-3 mr-1" /> Install
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forge Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Forge Marketplace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button variant="outline" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          {forgeSkills.length > 0 && (
            <div className="divide-y">
              {forgeSkills.map((s) => (
                <div key={s.name} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.description} · by {s.author}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {s.tags?.map((t) => (
                        <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </div>
                  <Badge variant="outline">{s.type}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
