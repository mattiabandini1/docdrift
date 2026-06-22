import { beforeEach, describe, expect, it, vi } from "vitest";

const { embedContent, GoogleGenAI } = vi.hoisted(() => {
  const embedContent = vi.fn();
  const GoogleGenAI = vi.fn();
  GoogleGenAI.mockImplementation(function (this: unknown) {
    return { models: { embedContent } };
  });
  return { embedContent, GoogleGenAI };
});

vi.mock("@google/genai", () => ({
  GoogleGenAI,
  embedContent,
}));

import {
  cosineSimilarity,
  findImpactedSections,
  getEmbedding,
  splitIntoSections,
} from "@/lib/embeddings/match";

const embedContentMock = embedContent;
const GoogleGenAIMock = GoogleGenAI;

beforeEach(() => {
  vi.clearAllMocks();
  process.env.GEMINI_API_KEY = "test-key";
});

describe("splitIntoSections", () => {
  it("splits document by ## headings correctly", () => {
    const doc = "## Installation\nRun npm install\n## Usage\nCall the function";
    const sections = splitIntoSections(doc);

    expect(sections).toHaveLength(2);
    expect(sections[0].heading).toBe("Installation");
    expect(sections[0].content).toContain("Run npm install");
    expect(sections[1].heading).toBe("Usage");
    expect(sections[1].content).toContain("Call the function");
  });

  it("returns single section when no ## headings present", () => {
    const doc = "Just some plain text with no headings";
    const sections = splitIntoSections(doc);

    expect(sections).toHaveLength(1);
    expect(sections[0].heading).toBe("Document");
    expect(sections[0].content).toBe(doc);
  });

  it("trims whitespace from heading and content", () => {
    const doc = "##   Installation   \n  Run npm install  ";
    const sections = splitIntoSections(doc);

    expect(sections).toHaveLength(1);
    expect(sections[0].heading).toBe("Installation");
    expect(sections[0].content.startsWith("##   Installation")).toBe(true);
    expect(sections[0].content.endsWith("Run npm install")).toBe(true);
    expect(sections[0].heading).not.toMatch(/^\s|\s$/);
  });

  it("handles empty document", () => {
    const sections = splitIntoSections("");

    expect(sections).toHaveLength(1);
    expect(sections[0].content).toBe("");
    expect(sections[0].heading).toBe("Document");
    expect(sections[0].startIndex).toBe(0);
  });
});

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    expect(cosineSimilarity([1, 0, 0], [1, 0, 0])).toBe(1);
  });

  it("returns 0 for orthogonal vectors", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
  });

  it("returns -1 for opposite vectors", () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBe(-1);
  });

  it("returns 0 when either vector has magnitude 0", () => {
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
  });

  it("returns value between -1 and 1 for arbitrary vectors", () => {
    const result = cosineSimilarity([1, 2, 3], [4, 5, 6]);

    expect(result).toBeGreaterThanOrEqual(-1);
    expect(result).toBeLessThanOrEqual(1);
  });
});

describe("getEmbedding", () => {
  it("calls embedContent and returns the first embedding values", async () => {
    embedContentMock.mockResolvedValueOnce({
      embeddings: [{ values: [0.1, 0.2, 0.3] }],
    });

    const client = new GoogleGenAIMock({ apiKey: "test-key" });
    const result = await getEmbedding("hello world", client);

    expect(result).toEqual([0.1, 0.2, 0.3]);
    expect(embedContentMock).toHaveBeenCalledTimes(1);
  });
});

describe("findImpactedSections", () => {
  it("returns single section immediately without API call when doc has only one section", async () => {
    const results = await findImpactedSections("any diff", "no headings here");

    expect(results).toHaveLength(1);
    expect(results[0].similarity).toBe(1);
    expect(embedContentMock).not.toHaveBeenCalled();
  });

  it("returns top 3 sections maximum when more match above threshold", async () => {
    const diffVec = [1, 0, 0];
    const section1Vec = [1, 0, 0];
    const section2Vec = [0.9, 0.1, 0];
    const section3Vec = [0.8, 0.2, 0];
    const section4Vec = [0.1, 0.9, 0];

    embedContentMock
      .mockResolvedValueOnce({ embeddings: [{ values: diffVec }] })
      .mockResolvedValueOnce({ embeddings: [{ values: section1Vec }] })
      .mockResolvedValueOnce({ embeddings: [{ values: section2Vec }] })
      .mockResolvedValueOnce({ embeddings: [{ values: section3Vec }] })
      .mockResolvedValueOnce({ embeddings: [{ values: section4Vec }] });

    const doc =
      "## A\nfirst content\n## B\nsecond content\n## C\nthird content\n## D\nfourth content";
    const results = await findImpactedSections("diff", doc);

    expect(results).toHaveLength(3);
    expect(results[0].section.heading).toBe("A");
    expect(results[1].section.heading).toBe("B");
    expect(results[2].section.heading).toBe("C");
    expect(results[0].similarity).toBeGreaterThan(0.25);
  });

  it("always returns at least one section even when nothing passes threshold", async () => {
    const diffVec = [1, 0, 0];

    embedContentMock.mockImplementation(async () => ({
      embeddings: [{ values: [0.1, 0.9, 0] }],
    }));
    embedContentMock.mockResolvedValueOnce({
      embeddings: [{ values: diffVec }],
    });

    const doc = "## A\nfirst\n## B\nsecond\n## C\nthird";
    const results = await findImpactedSections("diff", doc);

    expect(results).toHaveLength(1);
    expect(results[0].similarity).toBeLessThanOrEqual(0.25);
  });
});
