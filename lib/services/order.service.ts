import { prisma } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";
import type { GuestOrderInput } from "@/lib/validations/order";
import type { OrderStatus, Prisma } from "@prisma/client";

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: { include: { product: { include: { images: true } } } };
    user: true;
  };
}>;

export async function createGuestOrder(input: GuestOrderInput) {
  const product = await prisma.product.findFirst({
    where: { id: input.productId, deletedAt: null, isAvailable: true },
    include: { images: { where: { isPrimary: true }, take: 1 } },
  });

  if (!product) throw new Error("Product not found or unavailable");
  if (product.stockQuantity < input.quantity)
    throw new Error("Insufficient stock");

  const price = Number(product.discountedPrice ?? product.price);
  const subtotal = price * input.quantity;

  // Try to find existing user by phone
  const existingUser = await prisma.user.findUnique({
    where: { phone: input.guestPhone },
  });

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: existingUser?.id ?? null,
        isGuest: !existingUser,
        guestName: input.guestName,
        guestPhone: input.guestPhone,
        guestEmail: input.guestEmail || null,
        guestAddress: input.guestAddress,
        guestCity: input.guestCity,
        guestState: input.guestState,
        guestPostalCode: input.guestPostalCode,
        guestCountry: input.guestCountry,
        notes: input.notes || null,
        subtotal,
        total: subtotal,
        sourceUrl: `/buy/${input.productSlug}`,
        items: {
          create: {
            productId: product.id,
            productTitle: product.title,
            productSku: product.sku,
            imageUrl: product.images[0]?.url ?? null,
            price,
            quantity: input.quantity,
            subtotal,
          },
        },
      },
      include: {
        items: true,
      },
    });

    // Decrement stock
    await tx.product.update({
      where: { id: product.id },
      data: { stockQuantity: { decrement: input.quantity } },
    });

    return created;
  });

  return order;
}

export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
        },
      },
      user: true,
    },
  });
}

export async function getUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: { images: { where: { isPrimary: true }, take: 1 } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllOrdersAdmin(
  page = 1,
  limit = 20,
  filters: {
    status?: OrderStatus;
    search?: string;
    dateFrom?: Date;
    dateTo?: Date;
  } = {}
) {
  const where: Prisma.OrderWhereInput = {};

  if (filters.status) where.status = filters.status;
  if (filters.search) {
    where.OR = [
      { orderNumber: { contains: filters.search, mode: "insensitive" } },
      { guestName: { contains: filters.search, mode: "insensitive" } },
      { guestPhone: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
    if (filters.dateTo) where.createdAt.lte = filters.dateTo;
  }

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true } },
        user: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return { orders, total, pages: Math.ceil(total / limit), page };
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const updateData: Prisma.OrderUpdateInput = { status };

  if (status === "CONFIRMED") updateData.confirmedAt = new Date();
  else if (status === "SHIPPED") updateData.shippedAt = new Date();
  else if (status === "DELIVERED") updateData.deliveredAt = new Date();
  else if (status === "CANCELLED") updateData.cancelledAt = new Date();

  return prisma.order.update({
    where: { id },
    data: updateData,
    include: { items: true, user: true },
  });
}

export async function getDashboardStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalOrders,
    monthOrders,
    lastMonthOrders,
    totalRevenue,
    monthRevenue,
    pendingOrders,
    topProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({
      where: { createdAt: { gte: startOfMonth } },
    }),
    prisma.order.count({
      where: {
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { not: "CANCELLED" },
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.orderItem.groupBy({
      by: ["productId", "productTitle"],
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { subtotal: "desc" } },
      take: 5,
    }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { items: true, user: true },
    }),
  ]);

  return {
    totalOrders,
    monthOrders,
    lastMonthOrders,
    orderGrowth:
      lastMonthOrders > 0
        ? Math.round(((monthOrders - lastMonthOrders) / lastMonthOrders) * 100)
        : 100,
    totalRevenue: Number(totalRevenue._sum.total ?? 0),
    monthRevenue: Number(monthRevenue._sum.total ?? 0),
    pendingOrders,
    topProducts,
    recentOrders,
  };
}
