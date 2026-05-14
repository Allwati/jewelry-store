import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  const hashedPassword = await bcrypt.hash("Admin@123456", 12);
  const admin = await prisma.user.upsert({
    where: { phone: "+1234567890" },
    update: {},
    create: {
      phone: "+1234567890",
      email: "admin@lumiere.com",
      name: "Admin",
      passwordHash: hashedPassword,
      role: Role.ADMIN,
    },
  });
  console.log("✅ Admin created:", admin.email);

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "rings" },
      update: {},
      create: {
        name: "Rings",
        slug: "rings",
        description: "Elegant rings for every occasion",
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: "necklaces" },
      update: {},
      create: {
        name: "Necklaces",
        slug: "necklaces",
        description: "Beautiful necklaces and pendants",
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: "earrings" },
      update: {},
      create: {
        name: "Earrings",
        slug: "earrings",
        description: "Stunning earrings for every style",
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: "bracelets" },
      update: {},
      create: {
        name: "Bracelets",
        slug: "bracelets",
        description: "Luxurious bracelets and bangles",
        sortOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: "brooches" },
      update: {},
      create: {
        name: "Brooches",
        slug: "brooches",
        description: "Vintage and modern brooches",
        sortOrder: 5,
      },
    }),
  ]);
  console.log(`✅ ${categories.length} categories created`);

  const [rings, necklaces, earrings, bracelets] = categories;

  // Products
  const products = [
    {
      title: "Diamond Solitaire Ring",
      slug: "diamond-solitaire-ring",
      sku: "RING-001",
      description:
        "A timeless 18K white gold solitaire ring featuring a brilliant-cut 1.0 carat diamond. Perfect for engagements or as a statement piece. Certified by GIA.",
      shortDescription: "18K white gold, 1.0ct brilliant diamond",
      price: 2999.99,
      discountedPrice: 2499.99,
      stockQuantity: 15,
      categoryId: rings.id,
      isFeatured: true,
      material: "18K White Gold",
      weight: 4.2,
      tags: ["diamond", "gold", "engagement", "solitaire"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
          altText: "Diamond Solitaire Ring - Front View",
          isPrimary: true,
        },
        {
          url: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800",
          altText: "Diamond Solitaire Ring - Side View",
        },
      ],
    },
    {
      title: "Rose Gold Diamond Halo Ring",
      slug: "rose-gold-diamond-halo-ring",
      sku: "RING-002",
      description:
        "An exquisite 14K rose gold halo ring featuring a 0.75 carat center diamond surrounded by a dazzling halo of smaller diamonds.",
      shortDescription: "14K rose gold with diamond halo",
      price: 1899.99,
      stockQuantity: 8,
      categoryId: rings.id,
      isFeatured: true,
      material: "14K Rose Gold",
      weight: 3.8,
      tags: ["diamond", "rose gold", "halo", "engagement"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=800",
          altText: "Rose Gold Diamond Halo Ring",
          isPrimary: true,
        },
      ],
    },
    {
      title: "Pearl Strand Necklace",
      slug: "pearl-strand-necklace",
      sku: "NECK-001",
      description:
        "A classic 18-inch strand of Akoya cultured pearls, hand-knotted on silk with an 18K gold clasp. Each pearl measures 7-8mm.",
      shortDescription: "Akoya cultured pearls, 18K gold clasp",
      price: 799.99,
      discountedPrice: 649.99,
      stockQuantity: 20,
      categoryId: necklaces.id,
      isFeatured: true,
      material: "Akoya Pearl, 18K Gold",
      tags: ["pearl", "necklace", "classic", "gold"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800",
          altText: "Pearl Strand Necklace",
          isPrimary: true,
        },
      ],
    },
    {
      title: "Diamond Tennis Necklace",
      slug: "diamond-tennis-necklace",
      sku: "NECK-002",
      description:
        "A stunning 16-inch tennis necklace featuring 3 carats of round brilliant diamonds set in 18K white gold.",
      shortDescription: "3ct total diamonds in 18K white gold",
      price: 4599.99,
      stockQuantity: 5,
      categoryId: necklaces.id,
      isFeatured: false,
      material: "18K White Gold",
      tags: ["diamond", "tennis", "necklace", "luxury"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800",
          altText: "Diamond Tennis Necklace",
          isPrimary: true,
        },
      ],
    },
    {
      title: "Diamond Stud Earrings",
      slug: "diamond-stud-earrings",
      sku: "EARR-001",
      description:
        "Classic 14K white gold diamond stud earrings featuring 1.0 carat total weight of G-H color, VS clarity diamonds.",
      shortDescription: "1.0ct TW diamond studs, 14K white gold",
      price: 1299.99,
      discountedPrice: 999.99,
      stockQuantity: 25,
      categoryId: earrings.id,
      isFeatured: true,
      material: "14K White Gold",
      tags: ["diamond", "studs", "earrings", "classic"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800",
          altText: "Diamond Stud Earrings",
          isPrimary: true,
        },
      ],
    },
    {
      title: "Sapphire Drop Earrings",
      slug: "sapphire-drop-earrings",
      sku: "EARR-002",
      description:
        "Elegant 18K yellow gold drop earrings featuring oval Ceylon sapphires accented with diamond halos.",
      shortDescription: "Ceylon sapphires with diamond halos",
      price: 2199.99,
      stockQuantity: 10,
      categoryId: earrings.id,
      isFeatured: false,
      material: "18K Yellow Gold",
      tags: ["sapphire", "drop", "earrings", "yellow gold"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=800",
          altText: "Sapphire Drop Earrings",
          isPrimary: true,
        },
      ],
    },
    {
      title: "Diamond Tennis Bracelet",
      slug: "diamond-tennis-bracelet",
      sku: "BRAC-001",
      description:
        "A magnificent 7-inch diamond tennis bracelet featuring 5 carats of round brilliant diamonds in 18K white gold.",
      shortDescription: "5ct TW diamonds, 18K white gold, 7 inch",
      price: 5999.99,
      discountedPrice: 5499.99,
      stockQuantity: 7,
      categoryId: bracelets.id,
      isFeatured: true,
      material: "18K White Gold",
      tags: ["diamond", "tennis", "bracelet", "luxury"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800",
          altText: "Diamond Tennis Bracelet",
          isPrimary: true,
        },
      ],
    },
    {
      title: "Gold Bangle Bracelet",
      slug: "gold-bangle-bracelet",
      sku: "BRAC-002",
      description:
        "An elegant 18K solid gold bangle bracelet with a brushed finish and polished edges. Perfect for everyday luxury.",
      shortDescription: "18K solid gold bangle, brushed finish",
      price: 1499.99,
      stockQuantity: 18,
      categoryId: bracelets.id,
      isFeatured: false,
      material: "18K Yellow Gold",
      weight: 12.5,
      tags: ["gold", "bangle", "bracelet", "everyday"],
      images: [
        {
          url: "https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=800",
          altText: "Gold Bangle Bracelet",
          isPrimary: true,
        },
      ],
    },
  ];

  for (const productData of products) {
    const { images, ...product } = productData;
    const existing = await prisma.product.findUnique({
      where: { slug: product.slug },
    });
    if (!existing) {
      const created = await prisma.product.create({
        data: {
          ...product,
          price: product.price,
          discountedPrice: product.discountedPrice ?? null,
          images: {
            create: images.map((img, index) => ({
              ...img,
              sortOrder: index,
            })),
          },
        },
      });
      console.log(`✅ Product created: ${created.title}`);
    }
  }

  console.log("\n🎉 Seeding complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Admin credentials:");
  console.log("  Phone: +1234567890");
  console.log("  Password: Admin@123456");
  console.log("  URL: http://localhost:3000/admin");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
