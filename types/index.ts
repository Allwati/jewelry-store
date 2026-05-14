export type { Role, OrderStatus } from "@prisma/client";

export interface CartItem {
  productId: string;
  title: string;
  slug: string;
  price: number;
  imageUrl: string;
  quantity: number;
  stockQuantity: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  pages: number;
  page: number;
}

export interface AdminUser {
  id: string;
  phone: string;
  email: string | null;
  name: string | null;
  role: "ADMIN" | "CUSTOMER";
}
