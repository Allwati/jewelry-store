import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/shop/order-status-badge";
import { requireAuth } from "@/lib/auth";
import { getUserOrders } from "@/lib/services/order.service";
import { formatPrice, formatDate } from "@/lib/utils";
import { getT } from "@/lib/server-i18n";

export default async function OrdersPage() {
  let session;
  try {
    session = await requireAuth();
  } catch {
    redirect("/login?redirect=/orders");
  }

  const [orders, t] = await Promise.all([getUserOrders(session.sub), getT()]);

  if (!orders.length) {
    return (
      <div className="container max-w-2xl py-24 text-center">
        <Package className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-serif text-3xl font-bold mb-3">{t("userOrders.noOrders")}</h1>
        <p className="text-muted-foreground mb-8">
          {t("userOrders.noOrdersDesc")}
        </p>
        <Button variant="gold" asChild>
          <Link href="/products">{t("userOrders.browseCollection")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="font-serif text-3xl font-bold mb-8">{t("userOrders.title")}</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-xl border border-border/50 bg-card overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/30 bg-muted/20">
              <div>
                <p className="font-mono text-sm font-semibold">
                  {order.orderNumber}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <OrderStatusBadge status={order.status} />
                <span className="font-bold">{formatPrice(Number(order.total))}</span>
              </div>
            </div>

            <div className="px-5 py-4">
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {item.quantity}× {item.productTitle}
                    </span>
                    <span>{formatPrice(Number(item.subtotal))}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
