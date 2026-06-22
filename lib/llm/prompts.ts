/**
 * System prompt sent as a system instruction to the LLM.
 */
export const SYSTEM_PROMPT = `You are a technical documentation assistant for DocDrift.
Your task: given a Git diff from a merged PR and the current documentation content,
update ONLY the sections of the documentation that are directly impacted by the changes.

Rules:
- Write in the same language and tone as the existing documentation
- Do not add new sections unless the diff introduces entirely new functionality
- Do not remove existing content unless the diff explicitly removes that functionality
- Keep the same markdown structure and formatting
- Return ONLY the updated documentation text, no explanations, no preamble, no code fences
- If the diff does not impact the documentation meaningfully, return exactly: NO_UPDATE_NEEDED

Documentation mode context:
- internal: README or internal technical doc for the development team
- public: user-facing documentation, avoid technical jargon
- both: balance technical accuracy with user readability`;

export type PromptParams = {
  diff: string;
  currentDoc: string;
  docPath: string;
  docMode: "internal" | "public" | "both";
};

/**
 * Builds the user prompt for the LLM by combining the documentation mode, current
 * documentation content, and the git diff.
 *
 * @param params - The parameters containing diff, current doc, path, and mode.
 * @returns A formatted prompt string for the LLM.
 */
export function buildPrompt(params: PromptParams): string {
  return `Doc mode: ${params.docMode}
File: ${params.docPath}

--- CURRENT DOCUMENTATION ---
${params.currentDoc}

--- GIT DIFF ---
${params.diff}

Update the documentation based on the diff above.`;
}
