import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";

/**
 * POST /api/stripe/portal
 * Creates a Stripe Customer Portal session for managing the current
 * subscription. Requires authentication and an existing Stripe customer.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  const stripeCustomerId = profile?.stripe_customer_id ?? null;

  if (!stripeCustomerId) {
    return NextResponse.json(
      { error: "No subscription found", code: "NO_SUBSCRIPTION" },
      { status: 400 }
    );
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  });

  return NextResponse.json({ data: { url: portalSession.url } });
}
