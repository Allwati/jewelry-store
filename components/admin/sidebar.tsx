"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Diamond,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import { useLanguage } from "@/contexts/language-context";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { toast } from "sonner";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const clearUser = useAuthStore((s) => s.clearUser);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();

  const navItems = [
    { href: "/admin", label: t("adminSidebar.dashboard"), icon: LayoutDashboard, exact: true },
    { href: "/admin/products", label: t("adminSidebar.products"), icon: Package },
    { href: "/admin/orders", label: t("adminSidebar.orders"), icon: ShoppingBag },
    { href: "/admin/customers", label: t("adminSidebar.customers"), icon: Users },
  ];

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      clearUser();
      toast.success("Logged out");
      router.push("/admin/login");
    } catch {
      toast.error("Logout failed");
    }
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 p-6 border-b border-border/40">
        <Diamond className="h-6 w-6 text-gold-500" />
        <div>
          <span className="font-serif font-bold text-lg">Lumière</span>
          <p className="text-xs text-muted-foreground">{t("adminSidebar.adminPanel")}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/40 space-y-1">
        <div className="flex justify-start ps-1">
          <LanguageSwitcher />
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 me-3" />
          {t("adminSidebar.logout")}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 bg-background border-r border-border/40 flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <div className="lg:hidden fixed top-4 start-4 z-50">
        <Button
          size="icon"
          variant="outline"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="bg-background shadow-md"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed start-0 top-0 bottom-0 w-56 bg-background border-e border-border/40 z-50 flex flex-col">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
