"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateProfileDetails, generateNewAvatar } from "@/lib/actions/settings";
import { signOut, useSession } from "next-auth/react";
import { SignOut, User, ArrowsClockwise } from "@phosphor-icons/react";

interface SettingsClientProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function SettingsClient({ user }: SettingsClientProps) {
  const { update } = useSession();
  const [isPendingName, startTransitionName] = useTransition();
  const [isPendingAvatar, startTransitionAvatar] = useTransition();
  const [name, setName] = useState(user.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user.image || "");
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    startTransitionName(async () => {
      const formData = new FormData();
      formData.append("name", name);
      const res = await updateProfileDetails(formData);
      if (res.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        await update({ name: name });
        setMessage({ type: "success", text: "Profile updated successfully." });
      }
    });
  };

  const handleGenerateAvatar = async () => {
    setMessage(null);
    startTransitionAvatar(async () => {
      const res = await generateNewAvatar();
      if (res.error) {
        setMessage({ type: "error", text: res.error });
      } else if (res.user?.avatarUrl) {
        setAvatarUrl(res.user.avatarUrl);
        await update({ image: res.user.avatarUrl });
        setMessage({ type: "success", text: "New avatar generated!" });
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {message && (
        <div className={`p-4 rounded-md text-sm ${message.type === "success" ? "bg-accent-green-bg text-text-primary" : "bg-accent-red-bg text-text-primary"}`}>
          {message.text}
        </div>
      )}

      <Card variant="default">
        <div className="p-6">
          <h2 className="text-xl font-bold text-text-primary mb-1">Account Details</h2>
          <p className="text-sm text-text-secondary mb-6">Manage your basic profile information.</p>
          
          <form onSubmit={handleUpdateName} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-text-primary">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={user.email || ""}
                disabled
                className="bg-surface-alt text-text-secondary cursor-not-allowed"
              />
              <p className="text-xs text-text-secondary">Email cannot be changed directly.</p>
            </div>

            <div className="space-y-1">
              <label htmlFor="name" className="block text-sm font-medium text-text-primary">
                Display Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" disabled={isPendingName || name === (user.name || "")}>
                {isPendingName ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      <Card variant="default">
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-text-primary mb-1">Avatar</h2>
            <p className="text-sm text-text-secondary mb-4">
              Customize your profile picture. We use an automated engine to generate a unique avatar.
            </p>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleGenerateAvatar}
              disabled={isPendingAvatar}
              className="flex items-center gap-2"
            >
              <ArrowsClockwise className={isPendingAvatar ? "animate-spin" : ""} size={16} />
              {isPendingAvatar ? "Generating..." : "Generate New Avatar"}
            </Button>
          </div>
          
          <div className="shrink-0">
            {avatarUrl ? (
              <div className="w-24 h-24 rounded-lg overflow-hidden border border-border-strong bg-surface">
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-lg border border-border-strong bg-surface-alt flex items-center justify-center text-text-secondary">
                <User size={32} />
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card variant="default" className="border-accent-red-bg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold text-text-primary mb-1">Danger Zone</h2>
          <p className="text-sm text-text-secondary mb-6">Action here may require you to log in again.</p>
          
          <Button 
            type="button" 
            variant="destructive"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2"
          >
            <SignOut size={16} />
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
}
