import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ProfileDetailClient } from "@/components/features/profiles/ProfileDetailClient";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const profileId = parseInt(id, 10);
  if (isNaN(profileId)) return { title: "Profile" };

  const profile = await prisma.profile.findFirst({
    where: { id: profileId, deletedAt: null },
    select: { name: true },
  });

  return { title: profile?.name ?? "Profile" };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const profileId = parseInt(id, 10);
  if (isNaN(profileId)) notFound();

  const profile = await prisma.profile.findFirst({
    where: {
      id: profileId,
      userId: session.user.id,
      deletedAt: null,
    },
    include: {
      bookmarks: {
        include: {
          bookmark: {
            include: {
              tags: { include: { tag: true } },
            },
          },
        },
        orderBy: { addedAt: "asc" },
      },
    },
  });

  if (!profile) notFound();

  const bookmarks = profile.bookmarks.map((pb) => pb.bookmark);
  const urls = bookmarks.filter((b) => !b.deletedAt).map((b) => b.url);

  return (
    <ProfileDetailClient
      profile={{ id: profile.id, name: profile.name }}
      bookmarks={bookmarks}
      urls={urls}
    />
  );
}
