"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { trackFormSubmit } from "@/lib/analytics";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

type FormValues = z.infer<typeof schema>;

/**
 * Newsletter / lead-magnet capture form.
 *
 * TODO(user): Wire `onSubmit` to your real ESP / CRM (ConvertKit, Klaviyo,
 * Mailchimp, HubSpot, a serverless route, etc.). Right now it simulates a
 * successful submit and fires the `form_submit` analytics event.
 */
export function NewsletterForm({
  formName = "newsletter_footer",
  buttonLabel = "Get the tactics",
  placeholder = "you@company.com",
  tone = "dark",
}: {
  formName?: string;
  buttonLabel?: string;
  placeholder?: string;
  /** "dark" = for light backgrounds. "light" = for dark backgrounds (footer). */
  tone?: "dark" | "light";
}) {
  const [submitted, setSubmitted] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    // TODO(user): replace with a real API call to your email provider.
    await new Promise((resolve) => setTimeout(resolve, 700));
    trackFormSubmit(formName, { email_domain: data.email.split("@")[1] });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-600",
          tone === "light"
            ? "border-white/15 bg-white/5 text-white"
            : "border-brand-600/20 bg-brand-100 text-brand-600",
        )}
        role="status"
      >
        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        You&apos;re in! Check your inbox to confirm.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <label htmlFor={`${formName}-email`} className="sr-only">
            Email address
          </label>
          <Input
            id={`${formName}-email`}
            type="email"
            autoComplete="email"
            placeholder={placeholder}
            aria-invalid={!!errors.email}
            className={cn(
              tone === "light" &&
                "border-white/15 bg-white/5 text-white placeholder:text-white/40",
            )}
            {...register("email")}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(buttonVariants({ variant: "primary", size: "default" }))}
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              {buttonLabel}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
      {errors.email ? (
        <p
          className={cn(
            "mt-2 text-sm",
            tone === "light" ? "text-red-300" : "text-red-600",
          )}
        >
          {errors.email.message}
        </p>
      ) : null}
    </form>
  );
}
