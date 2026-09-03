import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getT } from "@/lib/server-i18n";

export const metadata: Metadata = { title: "Customers" };

export default async function AdminCustomersPage() {
  const [users, t] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { orders: true } } },
      take: 100,
    }),
    getT(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("adminCustomers.title")}</h1>
        <p className="text-muted-foreground">
          {t("adminCustomers.registeredUsers", { count: String(users.length) })}
        </p>
      </div>

      <div className="rounded-xl border border-border/50 overflow-hidden bg-background">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border/50 bg-muted/30">
              <tr>
                <th className="text-start px-4 py-3 text-sm font-medium text-muted-foreground">{t("adminCustomers.customerCol")}</th>
                <th className="text-start px-4 py-3 text-sm font-medium text-muted-foreground">{t("adminCustomers.phoneCol")}</th>
                <th className="text-start px-4 py-3 text-sm font-medium text-muted-foreground">{t("adminCustomers.roleCol")}</th>
                <th className="text-start px-4 py-3 text-sm font-medium text-muted-foreground">{t("adminCustomers.ordersCol")}</th>
                <th className="text-start px-4 py-3 text-sm font-medium text-muted-foreground">{t("adminCustomers.statusCol")}</th>
                <th className="text-start px-4 py-3 text-sm font-medium text-muted-foreground">{t("adminCustomers.joinedCol")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-sm">{user.name ?? t("adminCustomers.noName")}</p>
                      {user.email && (
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm">{user.phone}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="text-xs">
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">{user._count.orders}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.isActive ? "success" : "destructive"} className="text-xs">
                      {user.isActive ? t("adminCustomers.active") : t("adminCustomers.inactive")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground">{formatDateTime(user.createdAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!users.length && (
          <div className="text-center py-12 text-muted-foreground">
            {t("adminCustomers.noCustomers")}
          </div>
        )}
      </div>
    </div>
  );
}
