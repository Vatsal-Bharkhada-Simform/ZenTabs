import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileCard } from "@/components/features/profiles/ProfileCard";
import { AddProfileButton } from "@/components/features/profiles/AddProfileButton";

export const metadata: Metadata = {
  title: "Profiles",
};

export default async function ProfilesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profiles = await prisma.profile.findMany({
    where: { userId: session.user.id, deletedAt: null },
    include: {
      bookmarks: {
        include: { bookmark: { select: { url: true } } },
        orderBy: { addedAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const profileData = profiles.map((p) => ({
    id: p.id,
    name: p.name,
    count: p.bookmarks.length,
    urls: p.bookmarks.map((pb) => pb.bookmark.url),
  }));

  return (
    <div className="flex flex-col min-h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between px-4 md:px-8 py-6 bg-canvas">
        <div>
          <h2 className="text-xl font-semibold text-text-primary tracking-tight">Profiles</h2>
          <p className="text-sm text-text-secondary mt-1">
            Curate sets of bookmarks and open them all at once.
          </p>
        </div>
        <AddProfileButton />
      </div>

      {/* Content */}
      <div className="border-t border-border-strong">
        {profileData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-4 text-center animate-in fade-in duration-500">
            <div className="w-16 h-16 flex items-center justify-center bg-surface-alt border border-border-strong rounded-2xl mb-6">
              <span className="text-2xl select-none" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M216 48H40a16 16 0 0 0-16 16v128a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16zm0 144H40V64h176v128zm-96-96a8 8 0 0 1 8-8h48a8 8 0 0 1 0 16h-48a8 8 0 0 1-8-8zm0 32a8 8 0 0 1 8-8h48a8 8 0 0 1 0 16h-48a8 8 0 0 1-8-8zm-48-32a12 12 0 1 1 12 12 12 12 0 0 1-12-12zm0 32a12 12 0 1 1 12 12 12 12 0 0 1-12-12z" fill="currentColor" opacity="0.4"/>
                </svg>
              </span>
            </div>
            <h3 className="text-base font-semibold text-text-primary mb-2">No profiles yet</h3>
            <p className="text-sm text-text-secondary max-w-sm mb-6">
              Create a profile, pin bookmarks to it, and open them all in one click.
            </p>
            <AddProfileButton />
          </div>
        ) : (
          <div className="p-4 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profileData.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
