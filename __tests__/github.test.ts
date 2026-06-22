import { beforeEach, describe, expect, it, vi } from "vitest";
import { RequestError } from "@octokit/request-error";

const { getInstallationOctokit, handleGithubError } = vi.hoisted(() => {
  const getInstallationOctokit = vi.fn();
  const handleGithubError = vi.fn((error: unknown) => {
    throw error;
  });
  return { getInstallationOctokit, handleGithubError };
});

vi.mock("@/lib/github/client", () => ({
  getInstallationOctokit,
  handleGithubError,
}));

import { extractDiff } from "@/lib/github/diff";
import { openDocPR } from "@/lib/github/pr";

const getInstallationOctokitMock = getInstallationOctokit as unknown as ReturnType<
  typeof vi.fn
>;

function makeOctokit(overrides: {
  listFiles?: ReturnType<typeof vi.fn>;
  reposGet?: ReturnType<typeof vi.fn>;
  gitGetRef?: ReturnType<typeof vi.fn>;
  gitCreateRef?: ReturnType<typeof vi.fn>;
  createOrUpdateFileContents?: ReturnType<typeof vi.fn>;
  pullsCreate?: ReturnType<typeof vi.fn>;
}) {
  return {
    rest: {
      pulls: {
        listFiles: overrides.listFiles ?? vi.fn(),
        create: overrides.pullsCreate ?? vi.fn(),
      },
      repos: {
        get: overrides.reposGet ?? vi.fn(),
        createOrUpdateFileContents:
          overrides.createOrUpdateFileContents ?? vi.fn(),
      },
      git: {
        getRef: overrides.gitGetRef ?? vi.fn(),
        createRef: overrides.gitCreateRef ?? vi.fn(),
      },
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("extractDiff", () => {
  it("returns structured DiffResult with files and summary", async () => {
    const listFiles = vi.fn().mockResolvedValue({
      data: [
        {
          filename: "README.md",
          status: "modified",
          additions: 5,
          deletions: 2,
          patch: "@@ ... @@\n+new line",
        },
        {
          filename: "src/index.ts",
          status: "modified",
          additions: 1,
          deletions: 0,
          patch: "@@ @@\n+export",
        },
      ],
    });

    getInstallationOctokitMock.mockResolvedValueOnce(
      makeOctokit({ listFiles })
    );

    const result = await extractDiff("owner", "repo", 1, 12345);

    expect(result.files).toHaveLength(2);
    expect(result.summary).toContain("README.md");
  });

  it("filters out binary files (no patch property)", async () => {
    const listFiles = vi.fn().mockResolvedValue({
      data: [
        {
          filename: "image.png",
          status: "modified",
          additions: 0,
          deletions: 0,
          patch: undefined,
        },
        {
          filename: "src/index.ts",
          status: "modified",
          additions: 1,
          deletions: 0,
          patch: "@@ @@\n+export",
        },
      ],
    });

    getInstallationOctokitMock.mockResolvedValueOnce(
      makeOctokit({ listFiles })
    );

    const result = await extractDiff("owner", "repo", 1, 12345);

    expect(result.files).toHaveLength(1);
    expect(result.files[0].filename).toBe("src/index.ts");
  });

  it("filters out deleted files", async () => {
    const listFiles = vi.fn().mockResolvedValue({
      data: [
        {
          filename: "removed.ts",
          status: "removed",
          additions: 0,
          deletions: 10,
          patch: "@@ @@\n-old line",
        },
      ],
    });

    getInstallationOctokitMock.mockResolvedValueOnce(
      makeOctokit({ listFiles })
    );

    const result = await extractDiff("owner", "repo", 1, 12345);

    expect(result.files).toHaveLength(0);
  });

  it("summary mentions number of changed files", async () => {
    const listFiles = vi.fn().mockResolvedValue({
      data: [
        {
          filename: "a.ts",
          status: "modified",
          additions: 1,
          deletions: 0,
          patch: "@@ @@\n+1",
        },
        {
          filename: "b.ts",
          status: "modified",
          additions: 1,
          deletions: 0,
          patch: "@@ @@\n+1",
        },
        {
          filename: "c.ts",
          status: "modified",
          additions: 1,
          deletions: 0,
          patch: "@@ @@\n+1",
        },
      ],
    });

    getInstallationOctokitMock.mockResolvedValueOnce(
      makeOctokit({ listFiles })
    );

    const result = await extractDiff("owner", "repo", 1, 12345);

    expect(result.summary).toContain("3");
  });
});

describe("openDocPR", () => {
  it("creates branch with correct name docdrift/update-{prNumber}", async () => {
    const reposGet = vi.fn().mockResolvedValue({
      data: { default_branch: "main" },
    });
    const gitGetRef = vi.fn().mockResolvedValue({
      data: { object: { sha: "abc123" } },
    });
    const gitCreateRef = vi.fn().mockResolvedValue({ data: {} });
    const createOrUpdateFileContents = vi.fn().mockResolvedValue({ data: {} });
    const pullsCreate = vi.fn().mockResolvedValue({
      data: { html_url: "https://github.com/owner/repo/pull/1" },
    });

    getInstallationOctokitMock.mockResolvedValue(
      makeOctokit({
        reposGet,
        gitGetRef,
        gitCreateRef,
        createOrUpdateFileContents,
        pullsCreate,
      })
    );

    await openDocPR({
      owner: "owner",
      repo: "repo",
      prNumber: 42,
      prTitle: "feat: thing",
      updatedFiles: [
        { path: "README.md", content: "x", sha: "sha" },
      ],
      installationId: 1,
    });

    expect(gitCreateRef).toHaveBeenCalledTimes(1);
    const createRefArgs = gitCreateRef.mock.calls[0][0];
    expect(createRefArgs.ref).toContain("docdrift/update-42");
  });

  it("returns the PR URL from GitHub response", async () => {
    const reposGet = vi.fn().mockResolvedValue({
      data: { default_branch: "main" },
    });
    const gitGetRef = vi.fn().mockResolvedValue({
      data: { object: { sha: "abc123" } },
    });
    const gitCreateRef = vi.fn().mockResolvedValue({ data: {} });
    const createOrUpdateFileContents = vi.fn().mockResolvedValue({ data: {} });
    const pullsCreate = vi.fn().mockResolvedValue({
      data: { html_url: "https://github.com/owner/repo/pull/99" },
    });

    getInstallationOctokitMock.mockResolvedValue(
      makeOctokit({
        reposGet,
        gitGetRef,
        gitCreateRef,
        createOrUpdateFileContents,
        pullsCreate,
      })
    );

    const url = await openDocPR({
      owner: "owner",
      repo: "repo",
      prNumber: 7,
      prTitle: "feat",
      updatedFiles: [
        { path: "README.md", content: "x", sha: "sha" },
      ],
      installationId: 1,
    });

    expect(url).toBe("https://github.com/owner/repo/pull/99");
  });

  it("retries with timestamp suffix when branch already exists (409 error)", async () => {
    const reposGet = vi.fn().mockResolvedValue({
      data: { default_branch: "main" },
    });
    const gitGetRef = vi.fn().mockResolvedValue({
      data: { object: { sha: "abc123" } },
    });

    const conflictError = new RequestError("Reference already exists", 409, {
      request: { method: "POST", url: "", headers: {} },
      response: {
        url: "",
        status: 409,
        headers: {},
        data: { message: "Reference already exists" },
      },
    });

    const gitCreateRef = vi
      .fn()
      .mockRejectedValueOnce(conflictError)
      .mockResolvedValueOnce({ data: {} });

    const createOrUpdateFileContents = vi.fn().mockResolvedValue({ data: {} });
    const pullsCreate = vi.fn().mockResolvedValue({
      data: { html_url: "https://github.com/owner/repo/pull/1" },
    });

    getInstallationOctokitMock.mockResolvedValue(
      makeOctokit({
        reposGet,
        gitGetRef,
        gitCreateRef,
        createOrUpdateFileContents,
        pullsCreate,
      })
    );

    await openDocPR({
      owner: "owner",
      repo: "repo",
      prNumber: 5,
      prTitle: "feat",
      updatedFiles: [
        { path: "README.md", content: "x", sha: "sha" },
      ],
      installationId: 1,
    });

    expect(gitCreateRef).toHaveBeenCalledTimes(2);
    const secondCallArgs = gitCreateRef.mock.calls[1][0];
    expect(secondCallArgs.ref).toMatch(/^refs\/heads\/docdrift\/update-5-\d+$/);
  });
});
