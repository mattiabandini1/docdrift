import { GoogleGenAI } from "@google/genai";
import { buildPrompt, SYSTEM_PROMPT, type PromptParams } from "./prompts";

/** The Gemini model ID to use for documentation generation. */
export const MODEL = "gemini-2.5-flash-lite";

export type GenerateParams = PromptParams;

export type GenerateResult = string | null;

interface GenAIError extends Error {
  status?: number;
}

/**
 * Calls the Gemini LLM to generate an updated documentation section from
 * a git diff and the current documentation content.
 *
 * @param params - The parameters containing diff, current doc, path, and mode.
 * @returns The updated documentation string, or `null` if no update is needed.
 */
export async function generateDocUpdate(
  params: GenerateParams
): Promise<GenerateResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("LLM_UNAVAILABLE: Missing required environment variable: GEMINI_API_KEY");
  }

  const client = new GoogleGenAI({ apiKey });

  const prompt = buildPrompt(params);

  let text: string;

  try {
    const result = await client.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });
    text = result.text?.trim() ?? "";
  } catch (error) {
    if (
      error instanceof Error &&
      (error as GenAIError).status === 429
    ) {
      throw new Error("LLM_RATE_LIMITED");
    }

    if (error instanceof Error && error.message.startsWith("LLM_")) {
      throw error;
    }

    console.error("LLM generation error:", error);
    throw new Error(
      "LLM_UNAVAILABLE: " +
      (error instanceof Error ? error.message : "Unknown error")
    );
  }

  if (!text) {
    throw new Error("LLM_EMPTY_RESPONSE");
  }

  if (text === "NO_UPDATE_NEEDED") {
    return null;
  }

  if (text === params.currentDoc.trim()) {
    return null;
  }

  return text;
}
