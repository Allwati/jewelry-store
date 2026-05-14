"use client";

import Link from "next/link";
import { Diamond, Instagram, Facebook, Twitter } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

export function Footer() {
  const { t } = useLanguage();

  const categories = [
    { key: "rings", slug: "rings" },
    { key: "necklaces", slug: "necklaces" },
    { key: "earrings", slug: "earrings" },
    { key: "bracelets", slug: "bracelets" },
    { key: "brooches", slug: "brooches" },
  ] as const;

  const customerLinks = [
    { key: "myOrders", href: "/orders" },
    { key: "myAccount", href: "/profile" },
    { key: "sizeGuide", href: "/size-guide" },
    { key: "careInstructions", href: "/care" },
    { key: "returnsExchanges", href: "/returns" },
  ] as const;

  const companyLinks = [
    { key: "aboutUs", href: "/about" },
    { key: "blog", href: "/blog" },
    { key: "sustainability", href: "/sustainability" },
    { key: "privacyPolicy", href: "/privacy" },
    { key: "termsOfService", href: "/terms" },
  ] as const;

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Diamond className="h-6 w-6 text-gold-500" />
              <span className="font-serif text-xl font-bold">Lumière</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              {t("footer.tagline")}
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-muted-foreground hover:text-gold-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-gold-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-gold-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Collection */}
          <div>
            <h3 className="font-semibold mb-4">{t("footer.collection")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className="hover:text-gold-500 transition-colors"
                  >
                    {t(`footer.${cat.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-4">{t("footer.customerService")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {customerLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-gold-500 transition-colors"
                  >
                    {t(`footer.${item.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">{t("footer.company")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {companyLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-gold-500 transition-colors"
                  >
                    {t(`footer.${item.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Lumière Jewelry. {t("footer.rights")}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{t("footer.freeShipping")}</span>
            <span>·</span>
            <span>{t("footer.returns")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
