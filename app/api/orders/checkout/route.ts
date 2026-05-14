import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { z } from "zod";

const checkoutApiSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().min(1),
    })
  ).min(1),
  guestName: z.string().min(2).optional(),
  guestPhone: z.string().min(10).optional(),
  guestEmail: z.string().email().optional().or(z.literal("")),
  guestAddress: z.string().min(5),
  guestCity: z.string().min(2),
  guestState: z.string().optional().or(z.literal("")),
  guestPostalCode: z.string().optional().or(z.literal("")),
  guestCountry: z.string().default("LY"),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const body = await req.json();
    const input = checkoutApiSchema.safeParse(body);

    if (!input.success) {
      return NextResponse.json(
        { success: false, error: input.error.errors[0].message },
        { status: 400 }
      );
    }

    const { items, ...orderData } = input.data;

    // Fetch all products
    const products = await prisma.product.findMany({
      where: {
        id: { in: items.map((i) => i.productId) },
        deletedAt: null,
        isAvailable: true,
      },
      include: { images: { where: { isPrimary: true }, take: 1 } },
    });

    if (products.length !== items.length) {
      return NextResponse.json(
        { success: false, error: "One or more products not available" },
        { status: 400 }
      );
    }

    // Check stock and compute totals
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)!;
      if (product.stockQuantity < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Insufficient stock for ${product.title}` },
          { status: 400 }
        );
      }
    }

    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const price = Number(product.discountedPrice ?? product.price);
      return {
        productId: product.id,
        productTitle: product.title,
        productSku: product.sku,
        imageUrl: product.images[0]?.url ?? null,
        price,
        quantity: item.quantity,
        subtotal: price * item.quantity,
      };
    });

    const subtotal = orderItems.reduce((acc, i) => acc + i.subtotal, 0);

    // Find user by phone if guest
    let userId: string | null = session?.sub ?? null;
    if (!userId && orderData.guestPhone) {
      const existingUser = await prisma.user.findUnique({
        where: { phone: orderData.guestPhone },
      });
      userId = existingUser?.id ?? null;
    }

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          isGuest: !userId,
          ...orderData,
          guestEmail: orderData.guestEmail || null,
          notes: orderData.notes || null,
          subtotal,
          total: subtotal,
          items: { create: orderItems },
        },
      });

      // Decrement stock
      await Promise.all(
        items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { decrement: item.quantity } },
          })
        )
      );

      return created;
    });

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
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
