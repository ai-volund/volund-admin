import { Outlet } from "react-router-dom";
import { AdminSidebar } from "@/components/admin-sidebar";
import { useTheme } from "@/lib/use-theme";
import { useSession, signOut } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, Monitor, LogOut, User } from "lucide-react";

export function Layout() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  return (
    <div className="flex h-screen bg-background text-foreground">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-6 py-3 border-b shrink-0">
          <h2 className="text-sm font-medium text-muted-foreground">
            Platform Administration
          </h2>
          <div className="flex items-center gap-2">
            {session?.user && (
              <span className="text-sm text-muted-foreground">
                {session.user.email}
              </span>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg h-9 w-9 hover:bg-accent hover:text-accent-foreground transition-colors">
                <User className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="h-4 w-4 mr-2" /> Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="h-4 w-4 mr-2" /> Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Monitor className="h-4 w-4 mr-2" /> System
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
