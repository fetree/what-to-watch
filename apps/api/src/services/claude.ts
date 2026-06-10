import Anthropic from "@anthropic-ai/sdk";
import type { RecommendationItem } from "@what-to-watch/shared";

const SONNET = "claude-sonnet-4-6";

interface RatedTitle {
  title: string;
  mediaType: string;
  score: number;
}

interface CatalogCandidate {
  tmdbId: number;
  title: string;
  mediaType: string;
  overview: string;
  genres: string[];
  posterPath: string | null;
}

export function createClaudeService(apiKey: string) {
  const client = new Anthropic({ apiKey });

  async function extractTasteProfile(ratings: RatedTitle[]): Promise<string> {
    const ratingsList = ratings
      .map((r) => `- "${r.title}" (${r.mediaType}): ${r.score}/5`)
      .join("\n");

    const message = await client.messages.create({
      model: SONNET,
      max_tokens: 800,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: `Based on these title ratings, write a detailed taste profile for this viewer. Cover: preferred themes and genres, tone (light vs dark, serious vs comedic), pacing preference, comfort with dark or mature content, character-driven vs plot-driven preference, preferred eras or settings, and any other notable patterns you observe.

Ratings:
${ratingsList}

Write the taste profile as 3-4 dense paragraphs of flowing prose. Be specific and analytical — this profile will be used to find and explain recommendations.`,
        },
      ],
    });

    const block = message.content[0];
    if (block.type !== "text") throw new Error("Unexpected response type from Claude");
    return block.text;
  }

  async function rerankAndBlurb(
    tasteProfile: string,
    candidates: CatalogCandidate[],
  ): Promise<RecommendationItem[]> {
    const candidateList = candidates
      .map(
        (c, i) =>
          `${i + 1}. "${c.title}" (${c.mediaType}, tmdbId: ${c.tmdbId})\n   Genres: ${c.genres.join(", ")}\n   ${c.overview}`,
      )
      .join("\n\n");

    const message = await client.messages.create({
      model: SONNET,
      max_tokens: 2000,
      temperature: 0,
      tools: [
        {
          name: "return_recommendations",
          description: "Return the final ranked recommendations with blurbs",
          input_schema: {
            type: "object" as const,
            properties: {
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    tmdbId: { type: "number" },
                    title: { type: "string" },
                    mediaType: { type: "string" },
                    blurb: { type: "string", description: "2-sentence why you'd like this" },
                  },
                  required: ["tmdbId", "title", "mediaType", "blurb"],
                },
                minItems: 8,
                maxItems: 8,
              },
            },
            required: ["recommendations"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "return_recommendations" },
      messages: [
        {
          role: "user",
          content: `You are a taste-aware recommendation engine. Given a viewer's taste profile and a list of candidate titles, select the 8 best matches and write a 2-sentence personalized "why you'd like this" blurb for each.

Taste Profile:
${tasteProfile}

Candidates:
${candidateList}

Pick the 8 titles that best match this specific viewer's tastes. Rank them from best to least match. Write blurbs that reference specific elements from the taste profile to make them feel personal.`,
        },
      ],
    });

    const toolUse = message.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      throw new Error("Claude did not return tool use block");
    }

    const input = toolUse.input as { recommendations: Array<{ tmdbId: number; title: string; mediaType: string; blurb: string }> };
    return input.recommendations.map((r) => ({
      ...r,
      posterPath: candidates.find((c) => c.tmdbId === r.tmdbId)?.posterPath ?? null,
      genres: candidates.find((c) => c.tmdbId === r.tmdbId)?.genres ?? [],
    }));
  }

  return { extractTasteProfile, rerankAndBlurb };
}

export type ClaudeService = ReturnType<typeof createClaudeService>;
