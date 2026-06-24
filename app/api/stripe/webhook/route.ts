import { createServiceClient } from "@/lib/supabase/server";
import { stripe, getPlanFromPriceId } from "@/lib/stripe/client";
import { sendPaymentFailedEmail } from "@/lib/email/templates";
import { validateEnv } from "@/lib/env";

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events for subscription lifecycle management.
 * Always returns 200 to prevent Stripe from retrying (even on error).
 */
export async function POST(request: Request) {
  validateEnv();
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const supabase = createServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.supabase_user_id;
        const plan = session.metadata?.plan;
        const subscriptionId = session.subscription as string | null;

        if (userId && plan && subscriptionId) {
          await supabase
            .from("profiles")
            .update({ plan, stripe_subscription_id: subscriptionId })
            .eq("id", userId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const stripeCustomerId = subscription.customer as string;

        if (stripeCustomerId) {
          await supabase
            .from("profiles")
            .update({ plan: "free", stripe_subscription_id: null })
            .eq("stripe_customer_id", stripeCustomerId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const stripeCustomerId = subscription.customer as string;

        const priceId = subscription.items?.data?.[0]?.price?.id;
        if (stripeCustomerId && priceId) {
          const newPlan = getPlanFromPriceId(priceId);
          await supabase
            .from("profiles")
            .update({ plan: newPlan })
            .eq("stripe_customer_id", stripeCustomerId);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const stripeCustomerId = invoice.customer as string;

        if (stripeCustomerId) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email")
            .eq("stripe_customer_id", stripeCustomerId)
            .maybeSingle();

          const email = profile?.email ?? null;
          if (email) {
            await sendPaymentFailedEmail(email).catch(() => {
              // Silently ignore email failures.
            });
          }
        }
        break;
      }

      default:
        // Unhandled event type — acknowledged to prevent retries.
        break;
    }
  } catch {
    // Always return 200 to prevent Stripe from retrying.
  }

  return Response.json({ received: true });
}
