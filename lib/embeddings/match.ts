import { GoogleGenerativeAI } from "@google/generative-ai";

/** Represents a section of a markdown document split by level-2 heading. */
export type DocSection = {
  /** The heading text without the markdown marker. */
  heading: string;
  /** The full content under the heading, including the heading line. */
  content: string;
  /** The character index where the section starts in the original document. */
  startIndex: number;
};

/** Result of matching a diff against a documentation section. */
export type MatchResult = {
  /** The documentation section that was matched. */
  section: DocSection;
  /** Cosine similarity score between the diff and the section. */
  similarity: number;
};

const EMBEDDING_MODEL = "text-embedding-004";
const MAX_EMBEDDING_CHARS = 8000;
const SIMILARITY_THRESHOLD = 0.25;
const MAX_RESULTS = 3;

/**
 * Splits a markdown document into sections by level-2 heading (`## `).
 *
 * @param docContent - The full markdown content of the document.
 * @returns An array of document sections.
 */
export function splitIntoSections(docContent: string): DocSection[] {
  const trimmedDoc = docContent.trim();

  if (!trimmedDoc) {
    return [
      {
        heading: "Document",
        content: "",
        startIndex: 0,
      },
    ];
  }

  const headingRegex = /^(## )(.*)$/gm;
  const matches = Array.from(trimmedDoc.matchAll(headingRegex));

  if (matches.length === 0) {
    return [
      {
        heading: "Document",
        content: trimmedDoc,
        startIndex: 0,
      },
    ];
  }

  const sections: DocSection[] = [];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const heading = match[2].trim();
    const startIndex = match.index ?? 0;
    const nextMatch = matches[i + 1];
    const endIndex = nextMatch ? (nextMatch.index ?? trimmedDoc.length) : trimmedDoc.length;

    const content = trimmedDoc.slice(startIndex, endIndex).trim();

    sections.push({
      heading,
      content,
      startIndex,
    });
  }

  return sections;
}

/**
 * Calculates the cosine similarity between two numeric vectors.
 *
 * @param a - The first vector.
 * @param b - The second vector.
 * @returns A value between -1 and 1, or 0 if either vector has zero magnitude.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

/**
 * Generates an embedding vector for the given text using Google's embedding model.
 *
 * @param text - The text to embed.
 * @param client - An initialized GoogleGenerativeAI client.
 * @returns A numeric embedding vector.
 */
export async function getEmbedding(
  text: string,
  client: GoogleGenerativeAI
): Promise<number[]> {
  const truncatedText = text.slice(0, MAX_EMBEDDING_CHARS);

  try {
    const model = client.getGenerativeModel({ model: EMBEDDING_MODEL });
    const result = await model.embedContent(truncatedText);

    const values = result.embedding.values;

    if (!values || values.length === 0) {
      throw new Error("Empty embedding response");
    }

    return values;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error("EMBEDDING_FAILED: " + message);
  }
}

/**
 * Finds the documentation sections most likely impacted by a git diff.
 *
 * @param diff - The git diff text.
 * @param docContent - The current documentation content.
 * @returns A list of up to 3 sections sorted by similarity to the diff.
 */
export async function findImpactedSections(
  diff: string,
  docContent: string
): Promise<MatchResult[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("EMBEDDING_FAILED: Missing required environment variable: GEMINI_API_KEY");
  }

  const client = new GoogleGenerativeAI(apiKey);
  const sections = splitIntoSections(docContent);

  if (sections.length === 1) {
    return [{ section: sections[0], similarity: 1 }];
  }

  const diffEmbedding = await getEmbedding(diff, client);

  const scoredSections: MatchResult[] = [];

  for (const section of sections) {
    const sectionText = `${section.heading}\n${section.content}`;
    const sectionEmbedding = await getEmbedding(sectionText, client);
    const similarity = cosineSimilarity(diffEmbedding, sectionEmbedding);

    scoredSections.push({ section, similarity });
  }

  scoredSections.sort((a, b) => b.similarity - a.similarity);

  const aboveThreshold = scoredSections.filter(
    (result) => result.similarity > SIMILARITY_THRESHOLD
  );

  if (aboveThreshold.length > 0) {
    return aboveThreshold.slice(0, MAX_RESULTS);
  }

  return scoredSections.slice(0, 1);
}
