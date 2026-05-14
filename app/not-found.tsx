import Link from "next/link";
import { Diamond } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getT } from "@/lib/server-i18n";

export default async function NotFound() {
  const t = await getT();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <Diamond className="h-16 w-16 text-gold-400 mb-6" />
      <h1 className="font-serif text-4xl font-bold mb-3">{t("notFound.title")}</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        {t("notFound.desc")}
      </p>
      <div className="flex gap-4">
        <Button variant="gold" asChild>
          <Link href="/">{t("notFound.goHome")}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/products">{t("notFound.browseCollection")}</Link>
        </Button>
      </div>
    </div>
  );
}
