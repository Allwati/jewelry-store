import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAllOrdersAdmin } from "@/lib/services/order.service";
import type { OrderStatus } from "@prisma/client";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const status = searchParams.get("status") as OrderStatus | null;
    const search = searchParams.get("search") ?? undefined;

    const result = await getAllOrdersAdmin(page, limit, {
      status: status ?? undefined,
      search,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}
