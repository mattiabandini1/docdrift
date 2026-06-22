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
import { generateDocUpdate } from "@/lib/llm/generate";

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
  it("returns null when LLM responds NO_UPDATE_NEEDED", async () => {
    generateContentMock.mockResolvedValueOnce(makeResponseWithText("NO_UPDATE_NEEDED"));

    const result = await generateDocUpdate({
      diff: "diff",
      currentDoc: "doc",
      docPath: "README.md",
      docMode: "internal",
    });

    expect(result).toBeNull();
  });

  it("returns null when LLM response is identical to currentDoc", async () => {
    generateContentMock.mockResolvedValueOnce(makeResponseWithText("existing content"));

    const result = await generateDocUpdate({
      diff: "diff",
      currentDoc: "existing content",
      docPath: "README.md",
      docMode: "internal",
    });

    expect(result).toBeNull();
  });

  it("returns updated text when LLM returns different content", async () => {
    generateContentMock.mockResolvedValueOnce(makeResponseWithText("updated documentation"));

    const result = await generateDocUpdate({
      diff: "diff",
      currentDoc: "old documentation",
      docPath: "README.md",
      docMode: "internal",
    });

    expect(result).toBe("updated documentation");
  });

  it("throws LLM_UNAVAILABLE on network error", async () => {
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

  it("throws LLM_EMPTY_RESPONSE when response has no text", async () => {
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
});
