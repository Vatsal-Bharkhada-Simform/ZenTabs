import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  getCachedTags,
  getCachedBookmarks,
  getCachedProfilesForRows,
  getCachedCollectionsForRows,
} from "@/lib/data/cached";
import { TagsClient } from "@/components/features/tags/TagsClient";

export const metadata: Metadata = {
  title: "Tags",
};

export default async function TagsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const searchParams = await props.searchParams;
  const activeTag = typeof searchParams.tag === "string" ? searchParams.tag : "";

  const tags = await getCachedTags(session.user.id);
  const allTagsForRow: { id: number; name: string }[] = tags.map((t) => ({
    id: t.id,
    name: t.name,
  }));

  // If a tag is selected, fetch its bookmarks via the same cached helpers
  // the main dashboard uses, so this view stays consistent (and cached).
  const [bookmarks, profilesForRow, collectionsForRow] = activeTag
    ? await Promise.all([
        getCachedBookmarks(session.user.id, "", "date-desc", activeTag),
        getCachedProfilesForRows(session.user.id),
        getCachedCollectionsForRows(session.user.id),
      ])
    : [[], [], []];

  return (
    <TagsClient
      tags={tags}
      activeTag={activeTag}
      bookmarks={bookmarks}
      profiles={profilesForRow}
      collections={collectionsForRow}
      allTagsForRow={allTagsForRow}
    />
  );
}
