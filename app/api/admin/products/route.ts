import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  getAllProductsAdmin,
  createProduct,
} from "@/lib/services/product.service";
import { productSchema } from "@/lib/validations/product";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const search = searchParams.get("search") ?? undefined;

    const result = await getAllProductsAdmin(page, limit, search);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { images, ...productData } = body;

    const input = productSchema.safeParse(productData);
    if (!input.success) {
      return NextResponse.json(
        { success: false, error: input.error.errors[0].message },
        { status: 400 }
      );
    }

    const { categoryId, ...rest } = input.data;
    const product = await createProduct({
      ...rest,
      category: { connect: { id: categoryId } },
      images,
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : "Failed to create product";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
