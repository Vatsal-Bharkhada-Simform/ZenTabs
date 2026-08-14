"use server";

import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

export async function loginUser(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    // NextAuth throws a NEXT_REDIRECT error on success which we must not catch
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" };
        default:
          return { error: "Something went wrong" };
      }
    }
    // Required: rethrow Next.js redirect/navigation errors so they actually redirect
    throw error;
  }
}

export async function registerUser(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "An account with this email already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let avatarUrl = null;
    try {
      const avatarEngineUrl = process.env.AVATAR_ENGINE_URL;
      if (avatarEngineUrl) {
        const res = await fetch(avatarEngineUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.seed) {
            avatarUrl = `${avatarEngineUrl}?seed=${data.seed}`;
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch avatar seed:", e);
    }

    // Create user and a default "Personal" profile in a single transaction.
    // The profile is a session preset (for "Open All") — it does not own bookmarks.
    await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          avatarUrl,
        },
      });

      await tx.profile.create({
        data: {
          name: "Personal",
          userId: user.id,
        },
      });
    });
  } catch (error) {
    console.error("Failed to register:", error);
    return { error: "Failed to create account. Please try again." };
  }

  // Once registered, sign them in
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created, but failed to log in automatically." };
    }
    throw error;
  }
}
