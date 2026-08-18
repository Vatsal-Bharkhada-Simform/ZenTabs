"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfileDetails(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  if (!name || name.trim() === "") {
    return { error: "Name is required" };
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: name.trim() },
    });

    revalidatePath("/dashboard", "layout");
    return { success: true, user: { name: user.name } };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { error: "Failed to update profile" };
  }
}

export async function generateNewAvatar() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    let avatarUrl = null;
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

    if (!avatarUrl) {
      return { error: "Failed to generate new avatar from engine" };
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl },
    });

    revalidatePath("/dashboard", "layout");
    return { success: true, user: { avatarUrl: user.avatarUrl } };
  } catch (error) {
    console.error("Failed to generate avatar:", error);
    return { error: "Failed to generate new avatar" };
  }
}
