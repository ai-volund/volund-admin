import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX } from "lucide-react";

export function AccessDenied({ role }: { role: string | null }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <div className="flex justify-center mb-2">
            <ShieldX className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-xl">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The admin console requires <strong>platform_admin</strong> or{" "}
            <strong>admin</strong> role.
          </p>
          {role && (
            <p className="text-sm text-muted-foreground">
              Your current role: <code className="bg-muted px-1.5 py-0.5 rounded">{role}</code>
            </p>
          )}
          <Button variant="outline" className="w-full" onClick={() => signOut()}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
