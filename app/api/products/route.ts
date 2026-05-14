import { NextResponse } from "next/server";
import { getProducts } from "@/lib/services/product.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "12");
    const categorySlug = searchParams.get("category") ?? undefined;
    const search = searchParams.get("search") ?? undefined;
    const sortBy = (searchParams.get("sort") as "price_asc" | "price_desc" | "newest" | "name") ?? undefined;
    const isFeatured = searchParams.get("featured") === "true" ? true : undefined;

    const result = await getProducts({
      page,
      limit,
      categorySlug,
      search,
      sortBy,
      isFeatured,
    });

    return NextResponse.json({ success: true, data: result });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
