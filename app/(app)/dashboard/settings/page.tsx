import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SettingsClient } from "@/components/features/settings/SettingsClient";

export const metadata = {
  title: "Settings | ZenTabs",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Ensure user has an ID before passing to client component
  if (!session.user.id) {
    return null;
  }

  const userForClient = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-[1200px] mx-auto w-full animate-in fade-in zoom-in-[0.98] duration-300">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-2">
          Settings
        </h1>
        <p className="text-text-secondary">
          Manage your account preferences and profile.
        </p>
      </header>
      
      <SettingsClient user={userForClient} />
    </div>
  );
}
