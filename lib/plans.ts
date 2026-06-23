/**
 * Plan limits for enforcement across the application.
 * Free: 1 repo, 10 updates/month per repo.
 * Starter: 3 repos, unlimited updates.
 * Pro: unlimited repos, unlimited updates.
 */
export const PLAN_LIMITS = {
  free: { repos: 1, updatesPerMonth: 10 },
  starter: { repos: 3, updatesPerMonth: Infinity },
  pro: { repos: Infinity, updatesPerMonth: Infinity },
} as const;

export type PlanName = keyof typeof PLAN_LIMITS;
