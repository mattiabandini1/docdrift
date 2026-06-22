import { getInstallationOctokit, handleGithubError } from "./client";

export type DiffFile = {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  patch: string | undefined;
};

export type DiffResult = {
  files: DiffFile[];
  summary: string;
};

/**
 * Builds a human-readable summary of changed files.
 *
 * @param files - The list of changed files.
 * @param total - The total number of changed files reported by GitHub.
 * @returns A summary string.
 */
function buildSummary(files: DiffFile[], total: number): string {
  const displayNames = files.slice(0, 10).map((file) => file.filename);
  const more = total > displayNames.length ? ` and ${total - displayNames.length} more` : "";
  const largeNote = total > 20 ? " (large PR: more than 20 files)" : "";

  return `${total} file${total === 1 ? "" : "s"} changed: ${displayNames.join(", ")}${more}${largeNote}`;
}

/**
 * Extracts the diff of a pull request, filtering out binary and deleted files.
 *
 * @param owner - The repository owner.
 * @param repo - The repository name.
 * @param prNumber - The pull request number.
 * @param installationId - The GitHub App installation ID.
 * @returns A Promise resolving to the filtered diff result and summary.
 */
export async function extractDiff(
  owner: string,
  repo: string,
  prNumber: number,
  installationId: number
): Promise<DiffResult> {
  const octokit = await getInstallationOctokit(installationId);
  const context = `extracting diff for ${owner}/${repo}#${prNumber}`;

  try {
    const { data: files } = await octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber,
      per_page: 100,
    });

    const filteredFiles: DiffFile[] = files
      .filter((file) => file.status !== "removed" && file.patch != null)
      .map((file) => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        patch: file.patch ?? undefined,
      }));

    return {
      files: filteredFiles,
      summary: buildSummary(filteredFiles, files.length),
    };
  } catch (error) {
    handleGithubError(error, context);
  }
}
