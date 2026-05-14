import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signToken, setSessionCookie, clearSessionCookie } from "@/lib/auth";
import type { RegisterInput, LoginInput } from "@/lib/validations/auth";

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { phone: input.phone },
  });
  if (existing) throw new Error("Phone number already registered");

  if (input.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (emailExists) throw new Error("Email already registered");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      phone: input.phone,
      name: input.name,
      email: input.email || null,
      passwordHash,
      role: "CUSTOMER",
    },
  });

  const token = await signToken({
    sub: user.id,
    role: user.role,
    phone: user.phone,
  });

  await setSessionCookie(token);

  return {
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
    },
    token,
  };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { phone: input.phone },
  });

  if (!user || !user.passwordHash) {
    throw new Error("Invalid phone number or password");
  }
  if (!user.isActive) {
    throw new Error("Account is deactivated");
  }

  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) throw new Error("Invalid phone number or password");

  const token = await signToken({
    sub: user.id,
    role: user.role,
    phone: user.phone,
  });

  await setSessionCookie(token);

  return {
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
}

export async function logoutUser() {
  await clearSessionCookie();
}

export async function adminLogin(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { phone: input.phone },
  });

  if (!user || !user.passwordHash || user.role !== "ADMIN") {
    throw new Error("Invalid credentials or insufficient permissions");
  }

  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) throw new Error("Invalid credentials or insufficient permissions");

  const token = await signToken({
    sub: user.id,
    role: user.role,
    phone: user.phone,
  });

  await setSessionCookie(token);

  return {
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
    },
    token,
  };
}
