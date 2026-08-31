"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";

import { trackModalOpen } from "@/lib/analytics";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NewsletterForm } from "@/components/shared/NewsletterForm";

const SESSION_KEY = "de_exit_intent_shown";

/**
 * Exit-intent modal — desktop only, fires once per session.
 * Offers the lead-magnet PDF (CTA ladder depth 7).
 *
 * TODO(user): Wire the newsletter form to your ESP and deliver the real PDF
 * ("2026 Meta Ads Scaling Playbook") on confirmation.
 */
export function ExitIntentModal() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    // Desktop + fine-pointer only.
    const isDesktop =
      window.matchMedia("(min-width: 768px)").matches &&
      window.matchMedia("(pointer: fine)").matches;
    if (!isDesktop) return;

    try {
      if (sessionStorage.getItem(SESSION_KEY) === "true") return;
    } catch {
      /* ignore */
    }

    const onMouseOut = (e: MouseEvent) => {
      // Cursor left through the top of the viewport.
      if (e.clientY <= 0 && !e.relatedTarget) {
        setOpen(true);
        trackModalOpen("exit_intent_playbook");
        try {
          sessionStorage.setItem(SESSION_KEY, "true");
        } catch {
          /* ignore */
        }
        document.removeEventListener("mouseout", onMouseOut);
      }
    };

    document.addEventListener("mouseout", onMouseOut);
    return () => document.removeEventListener("mouseout", onMouseOut);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
            <Sparkles className="h-6 w-6" />
          </span>
          <DialogTitle>Wait — before you go</DialogTitle>
          <DialogDescription>
            Grab our free{" "}
            <span className="font-700 text-navy-900">
              2026 Meta Ads Scaling Playbook
            </span>{" "}
            — the exact framework we use to scale brands profitably past $100k/mo.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <NewsletterForm
            formName="exit_intent_playbook"
            buttonLabel="Send it to me"
            tone="dark"
          />
          <p className="mt-3 text-xs text-ink-600">
            No spam. Unsubscribe anytime. We&apos;ll email you the PDF instantly.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
