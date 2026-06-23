import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { stripe, getPriceIdFromPlan } from "@/lib/stripe/client";

const checkoutSchema = z.object({
  plan: z.enum(["starter", "pro"]),
});

/**
 * POST /api/stripe/create-checkout
 * Creates a Stripe Checkout Session for upgrading to a paid plan.
 * Requires authentication.
 */
export async function POST(request: Request) {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body", code: "INVALID_BODY" },
      { status: 400 }
    );
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid body",
        code: "VALIDATION_ERROR",
      },
      { status: 400 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  const email = (profile?.email as string) ?? user.email;

  if (!email) {
    return NextResponse.json(
      { error: "No email found for user", code: "NO_EMAIL" },
      { status: 400 }
    );
  }

  let stripeCustomerId = profile?.stripe_customer_id ?? undefined;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email,
      metadata: { supabase_user_id: user.id },
    });

    stripeCustomerId = customer.id;

    await supabase
      .from("profiles")
      .update({ stripe_customer_id: stripeCustomerId })
      .eq("id", user.id);
  }

  const priceId = getPriceIdFromPlan(parsed.data.plan);

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 7,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?cancelled=true`,
    metadata: { supabase_user_id: user.id, plan: parsed.data.plan },
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Failed to create checkout session", code: "CHECKOUT_FAILED" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { url: session.url } });
}
