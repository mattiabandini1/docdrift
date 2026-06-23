import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAppOctokit, getInstallationOctokit } from "@/lib/github/client";
import { revalidatePath } from "next/cache";

/**
 * GitHub App installation callback. Receives the installation_id after a user
 * installs or updates the DocDrift GitHub App. Lists accessible repos and
 * inserts or updates them in the database.
 * Redirects back to /repos with a status query parameter.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const installationIdRaw = searchParams.get("installation_id");

  // Auth check: must be logged in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  // Validate installation_id
  if (!installationIdRaw) {
    return NextResponse.redirect(
      `${origin}/repos?error=missing_installation`
    );
  }

  const installationId = Number(installationIdRaw);
  if (isNaN(installationId)) {
    return NextResponse.redirect(
      `${origin}/repos?error=missing_installation`
    );
  }

  try {
    // Fetch installation metadata with App-level JWT
    const appOctokit = await getAppOctokit();
    await appOctokit.rest.apps.getInstallation({
      installation_id: installationId,
    });

    // List repos accessible to this installation using an installation token
    const installOctokit = await getInstallationOctokit(installationId);
    const { data: repoData } = await installOctokit.rest.apps.listReposAccessibleToInstallation(
      { per_page: 100 }
    );

    const repos = repoData.repositories ?? [];

    for (const repo of repos) {
      const { data: existing } = await supabase
        .from("repos")
        .select("id")
        .eq("github_repo_id", repo.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        // Repo already connected — update full_name in case it changed
        await supabase
          .from("repos")
          .update({ full_name: repo.full_name })
          .eq("id", existing.id);
      } else {
        // New repo — insert as inactive; user must activate it manually
        await supabase.from("repos").insert({
          github_repo_id: repo.id,
          user_id: user.id,
          full_name: repo.full_name,
          is_active: false,
        });
      }
    }

    revalidatePath("/repos");
    return NextResponse.redirect(`${origin}/repos?connected=true`);
  } catch {
    return NextResponse.redirect(`${origin}/repos?error=github_api_error`);
  }
}
