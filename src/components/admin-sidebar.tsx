import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Bot,
  Puzzle,
  Link,
  Brain,
  Cpu,
  BarChart3,
  ScrollText,
  Settings,
  Shield,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/tenants", icon: Building2, label: "Tenants" },
  { to: "/agents", icon: Bot, label: "Agents" },
  { to: "/instances", icon: Cpu, label: "Instances" },
  { to: "/skills", icon: Puzzle, label: "Skills" },
  { to: "/providers", icon: Link, label: "Connections" },
  { to: "/llm-providers", icon: Brain, label: "LLM Providers" },
  { to: "/usage", icon: BarChart3, label: "Usage" },
  { to: "/audit", icon: ScrollText, label: "Audit Log" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function AdminSidebar() {
  return (
    <div className="w-56 border-r bg-sidebar flex flex-col shrink-0">
      <div className="flex items-center gap-2 px-4 py-4 border-b">
        <Shield className="h-5 w-5 text-sidebar-primary" />
        <span className="font-semibold text-sm tracking-tight text-sidebar-foreground">
          Volund Admin
        </span>
      </div>
      <nav className="flex-1 px-2 py-2 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                isActive && "bg-sidebar-accent text-sidebar-foreground font-medium"
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
