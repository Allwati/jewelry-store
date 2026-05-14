import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  getProductById,
  updateProduct,
  softDeleteProduct,
} from "@/lib/services/product.service";
import { productUpdateSchema } from "@/lib/validations/product";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: product });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { images, deleteImageIds, ...productData } = body;

    const input = productUpdateSchema.safeParse(productData);
    if (!input.success) {
      return NextResponse.json(
        { success: false, error: input.error.errors[0].message },
        { status: 400 }
      );
    }

    // Handle image operations in a transaction
    if (deleteImageIds?.length) {
      await prisma.productImage.deleteMany({
        where: { id: { in: deleteImageIds }, productId: id },
      });
    }

    if (images?.length) {
      await prisma.productImage.createMany({
        data: images.map(
          (img: { url: string; publicId?: string; altText?: string; isPrimary?: boolean }, index: number) => ({
            productId: id,
            ...img,
            sortOrder: index,
          })
        ),
      });
    }

    const updateData: Record<string, unknown> = { ...input.data };
    if (input.data.categoryId) {
      delete updateData.categoryId;
      updateData.category = { connect: { id: input.data.categoryId } };
    }

    const product = await updateProduct(id, updateData);
    return NextResponse.json({ success: true, data: product });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await softDeleteProduct(id);
    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "Delete failed" }, { status: 500 });
  }
}
