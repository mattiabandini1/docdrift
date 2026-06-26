import { GoogleGenAI } from "@google/genai";
import { buildPrompt, SYSTEM_PROMPT, type PromptParams } from "./prompts";
import { log } from "../logger";

export const PRIMARY_MODEL = "gemini-2.5-flash-lite";
export const FALLBACK_MODEL = "gemini-2.5-flash";

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 1000;

export type GenerateParams = PromptParams;

export type GenerateResult = {
  text: string | null;
  model: string;
};

interface GenAIError extends Error {
  status?: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const status = (error as GenAIError).status;

  if (status) {
    return status === 429 || status >= 500;
  }

  const msg = error.message.toLowerCase();
  return (
    msg.includes("timeout") ||
    msg.includes("econnreset") ||
    msg.includes("econnrefused") ||
    msg.includes("network") ||
    msg.includes("unavailable") ||
    msg.includes("overloaded") ||
    msg.includes("deadline") ||
    msg.includes("connection")
  );
}

async function attemptModel(
  client: GoogleGenAI,
  model: string,
  prompt: string,
  currentDoc: string
): Promise<string | null> {
  const result = await client.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
    },
  });

  const text = result.text?.trim() ?? "";

  if (!text) throw new Error("LLM_EMPTY_RESPONSE");
  if (text === "NO_UPDATE_NEEDED") return null;
  if (text === currentDoc.trim()) return null;

  return text;
}

/**
 * Generates an updated documentation section using Gemini with automatic
 * retry and fallback. Tries the primary model up to 3 times, then falls
 * back to the secondary model if all retries fail with transient errors.
 *
 * @param params - The parameters containing diff, current doc, path, and mode.
 * @returns The updated documentation string (or null) and which model answered.
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

  // Primary model with retries
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const text = await attemptModel(client, PRIMARY_MODEL, prompt, params.currentDoc);
      log("info", "llm", "Primary model succeeded", {
        model: PRIMARY_MODEL,
        attempt: attempt + 1,
      });
      return { text, model: PRIMARY_MODEL };
    } catch (error) {
      if (error instanceof Error && error.message === "LLM_EMPTY_RESPONSE") {
        throw error;
      }

      if (isTransientError(error) && attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        log("warn", "llm", "Transient error, retrying primary", {
          attempt: attempt + 1,
          model: PRIMARY_MODEL,
          delayMs: delay,
        });
        await sleep(delay);
        continue;
      }

      if (!isTransientError(error)) {
        if (error instanceof Error && error.message.startsWith("LLM_")) {
          throw error;
        }
        throw new Error(
          "LLM_UNAVAILABLE: " +
          (error instanceof Error ? error.message : "Unknown error")
        );
      }

      // Transient error, out of retries
      log("warn", "llm", "Primary model exhausted after retries", {
        model: PRIMARY_MODEL,
        attempts: MAX_RETRIES + 1,
      });
    }
  }

  // Fallback model
  log("warn", "llm", "Attempting fallback model", { model: FALLBACK_MODEL });
  try {
    const text = await attemptModel(client, FALLBACK_MODEL, prompt, params.currentDoc);
    log("info", "llm", "Fallback model succeeded", { model: FALLBACK_MODEL });
    return { text, model: FALLBACK_MODEL };
  } catch (error) {
    log("error", "llm", "Fallback model failed", {
      model: FALLBACK_MODEL,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    if (error instanceof Error && error.message.startsWith("LLM_")) {
      throw error;
    }

    throw new Error(
      "LLM_UNAVAILABLE: " +
      (error instanceof Error ? error.message : "Unknown error")
    );
  }
}
