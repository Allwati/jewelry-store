import { NextResponse } from "next/server";
import { guestOrderSchema } from "@/lib/validations/order";
import { createGuestOrder } from "@/lib/services/order.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = guestOrderSchema.safeParse(body);

    if (!input.success) {
      return NextResponse.json(
        { success: false, error: input.error.errors[0].message },
        { status: 400 }
      );
    }

    const order = await createGuestOrder(input.data);
    return NextResponse.json(
      {
        success: true,
        data: {
          orderNumber: order.orderNumber,
          id: order.id,
          total: order.total,
          status: order.status,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Order creation failed";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
