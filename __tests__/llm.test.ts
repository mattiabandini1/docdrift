import { beforeEach, describe, expect, it, vi } from "vitest";

const { generateContent, GoogleGenAI } = vi.hoisted(() => {
  const generateContent = vi.fn();
  const GoogleGenAI = vi.fn();
  GoogleGenAI.mockImplementation(function (this: unknown) {
    return { models: { generateContent } };
  });
  return { generateContent, GoogleGenAI };
});

vi.mock("@google/genai", () => ({
  GoogleGenAI,
  generateContent,
}));

import { buildPrompt } from "@/lib/llm/prompts";
import { generateDocUpdate, PRIMARY_MODEL, FALLBACK_MODEL } from "@/lib/llm/generate";

const generateContentMock = generateContent;
const GoogleGenAIMock = GoogleGenAI;

beforeEach(() => {
  vi.clearAllMocks();
  process.env.GEMINI_API_KEY = "test-key";
});

function makeResponseWithText(text: string) {
  return {
    get text() {
      return text;
    },
  };
}

describe("buildPrompt", () => {
  it("includes diff in output", () => {
    const prompt = buildPrompt({
      diff: "+ added line",
      currentDoc: "# Doc",
      docPath: "README.md",
      docMode: "internal",
    });

    expect(prompt).toContain("+ added line");
  });

  it("includes currentDoc in output", () => {
    const prompt = buildPrompt({
      diff: "+ added line",
      currentDoc: "# Doc",
      docPath: "README.md",
      docMode: "internal",
    });

    expect(prompt).toContain("# Doc");
  });

  it("includes docMode in output", () => {
    const prompt = buildPrompt({
      diff: "+ added line",
      currentDoc: "# Doc",
      docPath: "README.md",
      docMode: "internal",
    });

    expect(prompt).toContain("internal");
  });

  it("includes docPath in output", () => {
    const prompt = buildPrompt({
      diff: "+ added line",
      currentDoc: "# Doc",
      docPath: "README.md",
      docMode: "internal",
    });

    expect(prompt).toContain("README.md");
  });
});

describe("generateDocUpdate", () => {
  it("returns null text and primary model when LLM responds NO_UPDATE_NEEDED", async () => {
    generateContentMock.mockResolvedValueOnce(makeResponseWithText("NO_UPDATE_NEEDED"));

    const result = await generateDocUpdate({
      diff: "diff",
      currentDoc: "doc",
      docPath: "README.md",
      docMode: "internal",
    });

    expect(result.text).toBeNull();
    expect(result.model).toBe(PRIMARY_MODEL);
  });

  it("returns null text and primary model when response is identical to currentDoc", async () => {
    generateContentMock.mockResolvedValueOnce(makeResponseWithText("existing content"));

    const result = await generateDocUpdate({
      diff: "diff",
      currentDoc: "existing content",
      docPath: "README.md",
      docMode: "internal",
    });

    expect(result.text).toBeNull();
    expect(result.model).toBe(PRIMARY_MODEL);
  });

  it("returns updated text and primary model on success", async () => {
    generateContentMock.mockResolvedValueOnce(makeResponseWithText("updated documentation"));

    const result = await generateDocUpdate({
      diff: "diff",
      currentDoc: "old documentation",
      docPath: "README.md",
      docMode: "internal",
    });

    expect(result.text).toBe("updated documentation");
    expect(result.model).toBe(PRIMARY_MODEL);
  });

  it("throws LLM_UNAVAILABLE on network error (no fallback)", async () => {
    generateContentMock.mockRejectedValueOnce(new Error("network timeout"));

    await expect(
      generateDocUpdate({
        diff: "diff",
        currentDoc: "doc",
        docPath: "README.md",
        docMode: "internal",
      })
    ).rejects.toThrow(/LLM_UNAVAILABLE/);
  });

  it("throws LLM_EMPTY_RESPONSE when response has no text (no fallback)", async () => {
    generateContentMock.mockResolvedValueOnce(makeResponseWithText(""));

    await expect(
      generateDocUpdate({
        diff: "diff",
        currentDoc: "doc",
        docPath: "README.md",
        docMode: "internal",
      })
    ).rejects.toThrow(/LLM_EMPTY_RESPONSE/);
  });

  it("instantiates GoogleGenAI with the GEMINI_API_KEY env var", async () => {
    generateContentMock.mockResolvedValueOnce(makeResponseWithText("updated"));

    await generateDocUpdate({
      diff: "diff",
      currentDoc: "old",
      docPath: "README.md",
      docMode: "internal",
    });

    expect(GoogleGenAIMock).toHaveBeenCalledWith(
      expect.objectContaining({ apiKey: "test-key" })
    );
  });

  it("retries on transient 5xx error and succeeds on primary", async () => {
    const serverError = Object.assign(new Error("server error"), { status: 503 });
    generateContentMock
      .mockRejectedValueOnce(serverError)
      .mockResolvedValueOnce(makeResponseWithText("retry succeeded"));

    const result = await generateDocUpdate({
      diff: "diff",
      currentDoc: "old",
      docPath: "README.md",
      docMode: "internal",
    });

    expect(result.text).toBe("retry succeeded");
    expect(result.model).toBe(PRIMARY_MODEL);
    expect(generateContentMock).toHaveBeenCalledTimes(2);
  });

  it("retries on 429 rate limit and succeeds on second retry", async () => {
    const rateLimitError = Object.assign(new Error("rate limited"), { status: 429 });
    generateContentMock
      .mockRejectedValueOnce(rateLimitError)
      .mockRejectedValueOnce(rateLimitError)
      .mockResolvedValueOnce(makeResponseWithText("recovered"));

    const result = await generateDocUpdate({
      diff: "diff",
      currentDoc: "old",
      docPath: "README.md",
      docMode: "internal",
    });

    expect(result.text).toBe("recovered");
    expect(result.model).toBe(PRIMARY_MODEL);
    expect(generateContentMock).toHaveBeenCalledTimes(3);
  });

  it("falls back to secondary model after all primary retries fail transiently", async () => {
    const transientError = Object.assign(new Error("overloaded"), { status: 429 });
    generateContentMock
      .mockRejectedValueOnce(transientError)
      .mockRejectedValueOnce(transientError)
      .mockRejectedValueOnce(transientError)
      .mockResolvedValueOnce(makeResponseWithText("fallback doc"));

    const result = await generateDocUpdate({
      diff: "diff",
      currentDoc: "old",
      docPath: "README.md",
      docMode: "internal",
    });

    expect(result.text).toBe("fallback doc");
    expect(result.model).toBe(FALLBACK_MODEL);
    expect(generateContentMock).toHaveBeenCalledTimes(4);
  });

  it("does not fall back on permanent auth error (401)", async () => {
    const authError = Object.assign(new Error("invalid api key"), { status: 401 });
    generateContentMock.mockRejectedValueOnce(authError);

    await expect(
      generateDocUpdate({
        diff: "diff",
        currentDoc: "doc",
        docPath: "README.md",
        docMode: "internal",
      })
    ).rejects.toThrow(/LLM_UNAVAILABLE/);

    expect(generateContentMock).toHaveBeenCalledTimes(1);
  });

  it("does not fall back on permanent bad request (400)", async () => {
    const badRequest = Object.assign(new Error("unsupported model"), { status: 400 });
    generateContentMock.mockRejectedValueOnce(badRequest);

    await expect(
      generateDocUpdate({
        diff: "diff",
        currentDoc: "doc",
        docPath: "README.md",
        docMode: "internal",
      })
    ).rejects.toThrow(/LLM_UNAVAILABLE/);

    expect(generateContentMock).toHaveBeenCalledTimes(1);
  });

  it("throws when fallback also fails with transient error", async () => {
    const transientError = Object.assign(new Error("overloaded"), { status: 503 });
    generateContentMock
      .mockRejectedValueOnce(transientError)
      .mockRejectedValueOnce(transientError)
      .mockRejectedValueOnce(transientError)
      .mockRejectedValueOnce(transientError);

    await expect(
      generateDocUpdate({
        diff: "diff",
        currentDoc: "doc",
        docPath: "README.md",
        docMode: "internal",
      })
    ).rejects.toThrow(/LLM_UNAVAILABLE/);

    expect(generateContentMock).toHaveBeenCalledTimes(4);
  });
});
