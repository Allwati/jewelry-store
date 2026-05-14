"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Diamond, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { adminLoginSchema, type LoginInput } from "@/lib/validations/auth";
import { useAuthStore } from "@/store/auth.store";
import { useLanguage } from "@/contexts/language-context";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(adminLoginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Login failed");

      setUser(json.data);
      toast.success("Welcome, Admin!");
      router.push("/admin");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-900 to-stone-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-white mb-2">
            <Diamond className="h-8 w-8 text-gold-400" />
            <span className="font-serif text-3xl font-bold">Lumière</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-stone-400 text-sm">
            <ShieldCheck className="h-4 w-4" />
            <span>{t("adminLogin.adminPortal")}</span>
          </div>
        </div>

        <Card className="border-stone-700 bg-stone-800/50 backdrop-blur">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-white font-serif text-xl">
              {t("adminLogin.title")}
            </CardTitle>
            <CardDescription className="text-stone-400">
              {t("adminLogin.enterCredentials")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-stone-300">
                  {t("adminLogin.phoneNumber")}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  {...register("phone")}
                  className="bg-stone-700/50 border-stone-600 text-white placeholder:text-stone-500"
                />
                {errors.phone && (
                  <p className="text-xs text-red-400">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-stone-300">
                  {t("adminLogin.password")}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className="bg-stone-700/50 border-stone-600 text-white placeholder:text-stone-500 pe-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("adminLogin.signingIn")}
                  </>
                ) : (
                  t("adminLogin.signIn")
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-stone-500 text-xs mt-6">
          {t("adminLogin.secureAccess")}
        </p>
      </div>
    </div>
  );
}
