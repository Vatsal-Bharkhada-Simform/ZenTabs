"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCollection(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;

  if (!name || name.trim() === "") {
    return { error: "Name is required" };
  }

  try {
    const collection = await prisma.collection.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard/collections");
    revalidatePath("/dashboard");
    return { success: true, collection };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "A collection with this name already exists" };
    }
    console.error("Failed to create collection:", error);
    return { error: "Failed to create collection" };
  }
}

export async function updateCollection(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const id = parseInt(formData.get("id") as string, 10);
  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;

  if (isNaN(id)) return { error: "Invalid ID" };
  if (!name || name.trim() === "") return { error: "Name is required" };

  try {
    const collection = await prisma.collection.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
    });

    revalidatePath("/dashboard/collections");
    revalidatePath("/dashboard");
    return { success: true, collection };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "A collection with this name already exists" };
    }
    console.error("Failed to update collection:", error);
    return { error: "Failed to update collection" };
  }
}

export async function deleteCollection(id: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await prisma.collection.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard/collections");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete collection:", error);
    return { error: "Failed to delete collection" };
  }
}

export async function addBookmarkToCollection(collectionId: number, bookmarkId: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    // Verify ownership of both collection and bookmark
    const [collection, bookmark] = await Promise.all([
      prisma.collection.findUnique({ where: { id: collectionId, userId: session.user.id } }),
      prisma.bookmark.findUnique({ where: { id: bookmarkId, userId: session.user.id } }),
    ]);

    if (!collection || !bookmark) {
      return { error: "Collection or bookmark not found" };
    }

    await prisma.bookmarkCollection.create({
      data: {
        collectionId,
        bookmarkId,
      },
    });

    revalidatePath("/dashboard/collections");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") {
      // Already in collection
      return { success: true };
    }
    console.error("Failed to add bookmark to collection:", error);
    return { error: "Failed to add bookmark" };
  }
}

export async function removeBookmarkFromCollection(collectionId: number, bookmarkId: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    // Verify ownership of collection
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId, userId: session.user.id },
    });

    if (!collection) return { error: "Collection not found" };

    await prisma.bookmarkCollection.delete({
      where: {
        bookmarkId_collectionId: {
          collectionId,
          bookmarkId,
        },
      },
    });

    revalidatePath("/dashboard/collections");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to remove bookmark from collection:", error);
    return { error: "Failed to remove bookmark" };
  }
}
