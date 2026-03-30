import { Outlet, useLocation } from "react-router-dom";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/tenants": "Tenants",
  "/agents": "Agents",
  "/instances": "Instances",
  "/skills": "Skills",
  "/providers": "Connections",
  "/llm-providers": "LLM Providers",
  "/usage": "Usage",
  "/audit": "Audit Log",
  "/settings": "Settings",
};

export function Layout() {
  const location = useLocation();
  const title =
    Object.entries(pageTitles).find(([path]) =>
      path === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(path)
    )?.[1] ?? "Admin";

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <h1 className="text-base font-medium">{title}</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col overflow-auto p-4 lg:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
