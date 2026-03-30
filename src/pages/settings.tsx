import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Shield, Database, Server } from "lucide-react";

export function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Platform configuration and admin info
        </p>
      </div>

      {/* Admin Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-4 w-4" /> Current Admin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Row label="Email" value={session?.user?.email ?? "—"} />
          <Row label="Name" value={session?.user?.name ?? "—"} />
          <Row label="User ID" value={session?.user?.id ?? "—"} mono />
          <Row label="Session" value={session?.session?.id ?? "—"} mono />
        </CardContent>
      </Card>

      {/* Platform Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Server className="h-4 w-4" /> Platform
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Row label="Gateway" value="http://localhost:8080" mono />
          <Row label="Auth Service" value="http://localhost:3456" mono />
          <Row label="gRPC" value="localhost:9090" mono />
          <Row label="Control Plane" value="localhost:9091" mono />
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-4 w-4" /> Infrastructure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Row label="PostgreSQL" value="postgres:5432" mono />
          <Row label="NATS" value="nats:4222" mono />
          <Row label="Redis" value="redis:6379" mono />
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-4 w-4" /> Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Platform configuration is managed via environment variables on the
            gateway and auth service deployments. See the architecture docs for
            the full list of configurable options.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
