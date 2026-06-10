import OpenAI from "openai";

const MODEL = "text-embedding-3-small";

export function createEmbeddingsClient(apiKey: string) {
  const openai = new OpenAI({ apiKey });

  async function embedOne(text: string): Promise<number[]> {
    const res = await openai.embeddings.create({ model: MODEL, input: text });
    return res.data[0].embedding;
  }

  async function embedBatch(texts: string[]): Promise<number[][]> {
    const res = await openai.embeddings.create({ model: MODEL, input: texts });
    return res.data.map((d) => d.embedding);
  }

  return { embedOne, embedBatch };
}

export type EmbeddingsClient = ReturnType<typeof createEmbeddingsClient>;
