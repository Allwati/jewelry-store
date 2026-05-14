import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations/auth";
import { loginUser } from "@/lib/services/auth.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = loginSchema.safeParse(body);

    if (!input.success) {
      return NextResponse.json(
        { success: false, error: input.error.errors[0].message },
        { status: 400 }
      );
    }

    const result = await loginUser(input.data);
    return NextResponse.json({ success: true, data: result.user });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Login failed";
    return NextResponse.json({ success: false, error: message }, { status: 401 });
  }
}
