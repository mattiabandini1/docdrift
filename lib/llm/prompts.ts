export const SYSTEM_PROMPT = `You are a precise technical documentation editor for DocDrift.

Your job is to make the MINIMUM necessary change to a documentation section
based on what changed in a Git diff. You are a surgical editor, not a rewriter.

STRICT RULES — violating any of these is a critical failure:
1. NEVER add, remove, or alter markdown heading markers (##, ###, etc.)
   The heading must be preserved character-for-character.
2. NEVER merge two sentences into one. Each sentence in the original
   must remain a separate sentence in your output.
3. NEVER rewrite content that is still accurate. Only change what is
   directly affected by the diff.
4. NEVER add content that is not directly implied by the diff.
5. NEVER remove existing bullet points or list items unless the diff
   explicitly removes that functionality.
6. Preserve ALL formatting: blank lines, bullet point style (- vs *),
   code blocks, bold/italic markers.
7. Return the COMPLETE updated section — not just the changed lines.
   The output replaces the entire section, so include unchanged lines too.
8. Write in the same language as the existing documentation.
9. If the section is already accurate and complete given the diff,
   return exactly the string: NO_UPDATE_NEEDED
10. If the diff only modifies .md or .mdx files, return: NO_UPDATE_NEEDED
11. If the diff is unrelated to this documentation section, return: NO_UPDATE_NEEDED

Documentation tone based on doc_mode:
- internal: technical, concise, written for developers
- public: clear, friendly, written for end users avoiding jargon  
- both: balance technical accuracy with readability

BEFORE generating output, verify mentally:
- Does every ## heading in my output match exactly the original heading?
- Did I accidentally merge any sentences?
- Is every change I made directly supported by the diff?
- Did I preserve all blank lines and list formatting?
`;

export interface PromptParams {
  diff: string;
  currentDoc: string;
  docPath: string;
  docMode: "internal" | "public" | "both";
  modifiedFiles?: string[];
}

/**
 * Builds the user message for the LLM documentation update request.
 * Includes explicit anti-hallucination instructions in the prompt itself.
 *
 * @param params - The prompt parameters including diff, current doc, and context
 * @returns The formatted user message string
 */
export function buildPrompt(params: PromptParams): string {
  const { diff, currentDoc, docPath, docMode, modifiedFiles = [] } = params

  const modifiedFilesNote = modifiedFiles.length > 0
    ? `Files modified in this PR: ${modifiedFiles.join(', ')}\n` +
      `IMPORTANT: If any of these files are .md or .mdx files, ` +
      `return NO_UPDATE_NEEDED immediately without reading further.\n\n`
    : ''

  return `${modifiedFilesNote}Documentation tone: ${docMode}
File to update: ${docPath}

--- CURRENT DOCUMENTATION SECTION (preserve structure exactly) ---
${currentDoc}
--- END CURRENT SECTION ---

--- GIT DIFF (what changed in the codebase) ---
${diff}
--- END DIFF ---

Instructions:
- Make only the changes directly implied by the diff above
- Preserve the section heading exactly as written above
- Preserve all existing sentences that are still accurate
- Do not merge sentences together
- Return the complete updated section, or NO_UPDATE_NEEDED if no change is required`
}
