import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";

export const dynamic = "force-dynamic";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/components/shop/order-status-badge";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { getAllOrdersAdmin } from "@/lib/services/order.service";
import { formatPrice, formatDateTime } from "@/lib/utils";
import type { OrderStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { getT } from "@/lib/server-i18n";

export const metadata: Metadata = { title: "Orders" };

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    search?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const [params, t] = await Promise.all([searchParams, getT()]);
  const page = parseInt(params.page ?? "1");
  const status = params.status as OrderStatus | undefined;
  const search = params.search ?? undefined;

  const { orders, total, pages } = await getAllOrdersAdmin(page, 20, {
    status,
    search,
  });

  const statusOptions = [
    { value: "", label: t("adminOrders.allOrders") },
    { value: "PENDING", label: t("adminOrders.pending") },
    { value: "CONFIRMED", label: t("adminOrders.confirmed") },
    { value: "PROCESSING", label: t("adminOrders.processing") },
    { value: "SHIPPED", label: t("adminOrders.shipped") },
    { value: "DELIVERED", label: t("adminOrders.delivered") },
    { value: "CANCELLED", label: t("adminOrders.cancelled") },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("adminOrders.title")}</h1>
        <p className="text-muted-foreground">{t("adminOrders.ordersTotal", { total: String(total) })}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            defaultValue={search}
            placeholder={t("adminOrders.searchPlaceholder")}
            className="ps-9 w-64"
          />
          {status && <input type="hidden" name="status" value={status} />}
        </form>

        <div className="flex gap-2 flex-wrap">
          {statusOptions.map((opt) => (
            <Button
              key={opt.value}
              variant={status === opt.value || (!status && !opt.value) ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link
                href={`/admin/orders?${opt.value ? `status=${opt.value}` : ""}${search ? `&search=${search}` : ""}`}
              >
                {opt.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/50 overflow-hidden bg-background">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border/50 bg-muted/30">
              <tr>
                <th className="text-start px-4 py-3 text-sm font-medium text-muted-foreground">{t("adminOrders.orderCol")}</th>
                <th className="text-start px-4 py-3 text-sm font-medium text-muted-foreground">{t("adminOrders.customerCol")}</th>
                <th className="text-start px-4 py-3 text-sm font-medium text-muted-foreground">{t("adminOrders.itemsCol")}</th>
                <th className="text-start px-4 py-3 text-sm font-medium text-muted-foreground">{t("adminOrders.totalCol")}</th>
                <th className="text-start px-4 py-3 text-sm font-medium text-muted-foreground">{t("adminOrders.statusCol")}</th>
                <th className="text-start px-4 py-3 text-sm font-medium text-muted-foreground">{t("adminOrders.dateCol")}</th>
                <th className="text-end px-4 py-3 text-sm font-medium text-muted-foreground">{t("adminOrders.actionsCol")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-mono text-sm font-medium">{order.orderNumber}</p>
                      {order.isGuest && (
                        <Badge variant="secondary" className="text-[10px] mt-0.5">
                          {t("adminOrders.guest")}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <p className="font-medium">
                        {order.guestName ?? order.user?.name ?? t("adminOrders.unknown")}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {order.guestPhone ?? order.user?.phone ?? "—"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      {order.items.slice(0, 2).map((item) => (
                        <p key={item.id} className="line-clamp-1 text-muted-foreground">
                          {item.quantity}× {item.productTitle}
                        </p>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-xs text-muted-foreground">
                          {t("adminOrders.moreItems", { count: String(order.items.length - 2) })}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-sm">{formatPrice(Number(order.total))}</span>
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!orders.length && (
          <div className="text-center py-12 text-muted-foreground">
            {t("adminOrders.noOrdersFound")}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: Math.min(pages, 10) }).map((_, i) => (
            <Button
              key={i}
              variant={page === i + 1 ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href={`/admin/orders?page=${i + 1}${status ? `&status=${status}` : ""}${search ? `&search=${search}` : ""}`}>
                {i + 1}
              </Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
