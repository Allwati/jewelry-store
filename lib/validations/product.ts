import { z } from "zod";

export const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  shortDescription: z.string().max(300).optional(),
  price: z.number().positive("Price must be positive"),
  discountedPrice: z.number().positive().optional().nullable(),
  stockQuantity: z.number().int().min(0, "Stock cannot be negative"),
  categoryId: z.string().min(1, "Category is required"),
  isFeatured: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  material: z.string().optional(),
  weight: z.number().positive().optional().nullable(),
  dimensions: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export const productUpdateSchema = productSchema.partial();

export type ProductInput = z.infer<typeof productSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
