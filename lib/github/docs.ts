import { RequestError } from "@octokit/request-error";
import { type RestEndpointMethodTypes } from "@octokit/rest";
import { getInstallationOctokit, handleGithubError } from "./client";

export type DocFile = {
  path: string;
  content: string;
  sha: string;
};

type GetContentResponseData =
  RestEndpointMethodTypes["repos"]["getContent"]["response"]["data"];

/**
 * Fetches a single documentation file from the repository's default branch.
 *
 * @param owner - The repository owner.
 * @param repo - The repository name.
 * @param path - The file path in the repository.
 * @param installationId - The GitHub App installation ID.
 * @returns A Promise resolving to the file content and SHA, or undefined if the file does not exist.
 */
async function fetchSingleDoc(
  owner: string,
  repo: string,
  path: string,
  installationId: number
): Promise<DocFile | undefined> {
  const octokit = await getInstallationOctokit(installationId);
  const context = `fetching doc ${owner}/${repo}/${path}`;

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    if (typeof data !== "object" || data === null || !("content" in data)) {
      return undefined;
    }

    const fileData = data as Extract<GetContentResponseData, { type: "file" }>;

    return {
      path,
      content: Buffer.from(fileData.content, "base64").toString("utf-8"),
      sha: fileData.sha,
    };
  } catch (error) {
    if (error instanceof RequestError && error.status === 404) {
      return undefined;
    }

    handleGithubError(error, context);
  }
}

/**
 * Fetches the contents of multiple documentation files.
 *
 * @param owner - The repository owner.
 * @param repo - The repository name.
 * @param paths - The file paths to fetch.
 * @param installationId - The GitHub App installation ID.
 * @returns A Promise resolving to an array of existing doc files.
 */
export async function fetchDocContent(
  owner: string,
  repo: string,
  paths: string[],
  installationId: number
): Promise<DocFile[]> {
  const results = await Promise.all(
    paths.map((path) => fetchSingleDoc(owner, repo, path, installationId))
  );

  return results.filter((file): file is DocFile => file !== undefined);
}
