import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updateOrderStatus } from "@/lib/services/order.service";
import { updateOrderStatusSchema } from "@/lib/validations/order";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const input = updateOrderStatusSchema.safeParse(body);
    if (!input.success) {
      return NextResponse.json(
        { success: false, error: input.error.errors[0].message },
        { status: 400 }
      );
    }

    const order = await updateOrderStatus(id, input.data.status);

    // Log admin action
    const { prisma } = await import("@/lib/db");
    await prisma.adminLog.create({
      data: {
        adminId: session.sub,
        action: "UPDATE_ORDER",
        entityType: "Order",
        entityId: id,
        details: { newStatus: input.data.status },
      },
    });

    return NextResponse.json({ success: true, data: order });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
  }
}
