import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;

/**
 * Sends a notification email when a documentation PR has been opened.
 *
 * @param to - The recipient email address.
 * @param params - The email parameters.
 */
export async function sendDocUpdateEmail(
  to: string,
  params: { prNumber: number; prTitle: string; docPrUrl: string; repoName: string }
): Promise<void> {
  if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
    console.error("Missing required email environment variables");
    return;
  }

  const resend = new Resend(RESEND_API_KEY);

  await resend.emails.send({
    from: RESEND_FROM_EMAIL,
    to,
    subject: `DocDrift: documentation updated for PR #${params.prNumber}`,
    text:
      `DocDrift has opened a documentation PR for your merged PR.\n\n` +
      `Repository: ${params.repoName}\n` +
      `Triggered by: #${params.prNumber} — ${params.prTitle}\n` +
      `Documentation PR: ${params.docPrUrl}\n\n` +
      `Review and merge the documentation PR when ready.`,
  });
}

/**
 * Sends a notification email when a free plan user has reached their
 * monthly update limit.
 *
 * @param to - The recipient email address.
 * @param params - The email parameters.
 */
export async function sendLimitReachedEmail(
  to: string,
  params: { repoName: string }
): Promise<void> {
  if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
    console.error("Missing required email environment variables");
    return;
  }

  const resend = new Resend(RESEND_API_KEY);

  await resend.emails.send({
    from: RESEND_FROM_EMAIL,
    to,
    subject: "DocDrift: free plan limit reached",
    text:
      `You have reached the 10 updates/month limit on the free plan for ${params.repoName}. ` +
      `Upgrade to continue.`,
  });
}
