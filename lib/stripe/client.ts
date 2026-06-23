import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
  typescript: true,
});

/**
 * Maps a Stripe Price ID to a plan identifier.
 *
 * @param priceId - The Stripe Price ID from the subscription.
 * @returns The plan name, or `'free'` if the price ID is not recognised.
 */
export function getPlanFromPriceId(priceId: string): "starter" | "pro" | "free" {
  if (priceId === process.env.STRIPE_PRICE_STARTER) return "starter";
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  return "free";
}

/**
 * Returns the Stripe Price ID for the given plan.
 *
 * @param plan - The plan name.
 * @returns The Stripe Price ID environment variable value.
 */
export function getPriceIdFromPlan(plan: "starter" | "pro"): string {
  if (plan === "starter") return process.env.STRIPE_PRICE_STARTER!;
  return process.env.STRIPE_PRICE_PRO!;
}
