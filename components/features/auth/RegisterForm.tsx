"use client";

import { useActionState, useEffect } from "react";
import { AuthShell } from "./AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { registerUser } from "@/lib/actions/auth";
import { toast } from "sonner";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerUser, undefined);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <AuthShell
      heading="Create account."
      altLinkPrefix="Already have an account?"
      altLinkLabel="Sign in"
      altLinkHref="/login"
    >
      <form
        id="register-form"
        action={formAction}
        className="flex flex-col gap-4"
        noValidate
      >
        <Input
          id="register-name"
          name="name"
          label="Full name"
          type="text"
          placeholder="Alex Chen"
          autoComplete="name"
          required
        />

        <Input
          id="register-email"
          name="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <Input
          id="register-password"
          name="password"
          label="Password"
          type="password"
          placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
          autoComplete="new-password"
          hint="Minimum 8 characters"
          required
        />

        <Button
          id="register-submit"
          type="submit"
          variant="primary"
          size="lg"
          loading={isPending}
          className="w-full mt-2"
        >
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
