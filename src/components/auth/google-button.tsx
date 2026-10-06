"use client";

import { useState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

/**
 * "Continue with Google" button.
 *
 * Google accounts arrive with an already-verified email address, so these users
 * never need a confirmation mail or a password reset.
 *
 * New Google users become donors: the `handle_new_user` trigger defaults the
 * profile role to 'donor' when no role is supplied. NGOs sign up with email and
 * password so they can choose the NGO account type on the form.
 */
export function GoogleButton({
  next = "/dashboard",
  label = "Continue with Google",
}: {
  next?: string;
  label?: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;
      // On success the browser is sent to Google, so nothing else runs here.
    } catch {
      setError("Could not open Google sign-in. Please try again, or use your email and password below.");
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={handleClick}
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Opening Google…
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" aria-hidden />
            {label}
          </>
        )}
      </Button>
      {error && (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** Small "or" divider used between Google and the email form. */
export function AuthDivider() {
  return (
    <div className="flex items-center gap-3" aria-hidden>
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium uppercase tracking-wide text-muted">or</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
