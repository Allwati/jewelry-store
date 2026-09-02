import type { Metadata } from "next";
import { TrendingUp, ShoppingBag, Package, Clock } from "lucide-react";

export const dynamic = "force-dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/shop/order-status-badge";
import { getDashboardStats } from "@/lib/services/order.service";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { getT } from "@/lib/server-i18n";

export const metadata: Metadata = { title: "Dashboard" };

export const revalidate = 30;

export default async function AdminDashboard() {
  const [stats, t] = await Promise.all([getDashboardStats(), getT()]);

  const statCards = [
    {
      title: t("adminDashboard.totalRevenue"),
      value: formatPrice(Number(stats.totalRevenue)),
      sub: `${formatPrice(Number(stats.monthRevenue))} ${t("adminDashboard.thisMonth")}`,
      icon: TrendingUp,
      color: "text-gold-600",
      bg: "bg-gold-100 dark:bg-gold-900/20",
    },
    {
      title: t("adminDashboard.totalOrders"),
      value: stats.totalOrders.toLocaleString(),
      sub: `${stats.monthOrders} ${t("adminDashboard.thisMonth")} (${stats.orderGrowth > 0 ? "+" : ""}${stats.orderGrowth}%)`,
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: t("adminDashboard.pendingOrders"),
      value: stats.pendingOrders.toLocaleString(),
      sub: t("adminDashboard.awaitingConfirmation"),
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-100 dark:bg-yellow-900/20",
    },
    {
      title: t("adminDashboard.topProducts"),
      value: stats.topProducts.length.toLocaleString(),
      sub: t("adminDashboard.activeProductLines"),
      icon: Package,
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-900/20",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("adminDashboard.title")}</h1>
        <p className="text-muted-foreground">{t("adminDashboard.subtitle")}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.bg}`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("adminDashboard.recentOrders")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-2 border-b border-border/40 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-medium truncate">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.guestName ?? order.user?.name ?? t("adminDashboard.guest")} ·{" "}
                        {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ms-4">
                      <OrderStatusBadge status={order.status} />
                      <span className="font-semibold text-sm">
                        {formatPrice(Number(order.total))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("adminDashboard.topProducts")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topProducts.map((p, index) => (
                  <div key={p.productId} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.productTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {p._sum.quantity} {t("adminDashboard.sold")}
                      </p>
                    </div>
                    <span className="text-sm font-semibold flex-shrink-0">
                      {formatPrice(Number(p._sum.subtotal ?? 0))}
                    </span>
                  </div>
                ))}
                {!stats.topProducts.length && (
                  <p className="text-sm text-muted-foreground">{t("adminDashboard.noOrdersYet")}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
