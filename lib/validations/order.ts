import { z } from "zod";

export const guestOrderSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  productSlug: z.string().min(1),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(99),
  guestName: z.string().min(2, "Name must be at least 2 characters").max(100),
  guestPhone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .regex(/^\+?[\d\s\-()]{10,15}$/, "Invalid phone number"),
  guestEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  guestAddress: z.string().min(5, "Address is required").max(300),
  guestCity: z.string().min(2, "City is required").max(100),
  guestState: z.string().max(100).optional().or(z.literal("")),
  guestPostalCode: z.string().max(20).optional().or(z.literal("")),
  guestCountry: z.string().default("US"),
  notes: z.string().max(500).optional(),
});

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, "Cart is empty"),
  guestName: z.string().min(2).max(100).optional(),
  guestPhone: z
    .string()
    .min(10)
    .regex(/^\+?[\d\s\-()]{10,15}$/)
    .optional(),
  guestEmail: z.string().email().optional().or(z.literal("")),
  guestAddress: z.string().min(5).max(300),
  guestCity: z.string().min(2).max(100),
  guestState: z.string().max(100).optional().or(z.literal("")),
  guestPostalCode: z.string().max(20).optional().or(z.literal("")),
  guestCountry: z.string().default("US"),
  notes: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
});

export type GuestOrderInput = z.infer<typeof guestOrderSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
