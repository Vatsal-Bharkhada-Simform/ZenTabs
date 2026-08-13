"use client";

import { useActionState, useEffect } from "react";
import { AuthShell } from "./AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { loginUser } from "@/lib/actions/auth";
import { toast } from "sonner";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginUser, undefined);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <AuthShell
      heading="Sign in."
      altLinkPrefix="Don't have an account?"
      altLinkLabel="Create one"
      altLinkHref="/register"
    >
      <form
        id="login-form"
        action={formAction}
        className="flex flex-col gap-4"
        noValidate
      >
        <Input
          id="login-email"
          name="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <Input
          id="login-password"
          name="password"
          label="Password"
          type="password"
          placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
          autoComplete="current-password"
          required
        />

        <Button
          id="login-submit"
          type="submit"
          variant="primary"
          size="lg"
          loading={isPending}
          className="w-full mt-2"
        >
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
