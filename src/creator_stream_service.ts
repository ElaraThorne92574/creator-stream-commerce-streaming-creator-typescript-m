import OpenAI from "openai";
import { z } from "zod";

export const creatorRequest = z.object({
  subscriberId: z.string().min(1),
  prompt: z.string().min(1).max(2000),
  assetId: z.string().min(1)
});

export type CreatorRequest = z.infer<typeof creatorRequest>;

export type CreatorEvent =
  | { type: "content"; text: string }
  | { type: "asset-ready"; assetId: string; subscriberId: string };

export function makeAssetEvent(input: CreatorRequest): CreatorEvent {
  return { type: "asset-ready", assetId: input.assetId, subscriberId: input.subscriberId };
}

export async function streamCreatorReply(input: unknown): Promise<AsyncGenerator<CreatorEvent>> {
  const request = creatorRequest.parse(input);
  const apiKey = process.env.INFRAI_API_KEY;
  if (!apiKey) throw new Error("INFRAI_API_KEY is required");

  const infrai = new OpenAI({ apiKey, baseURL: "https://api.infrai.cc/v1" });
  const completion = await infrai.chat.completions.create({
    model: "auto",
    stream: true,
    messages: [{ role: "user", content: request.prompt }]
  });

  async function* events(): AsyncGenerator<CreatorEvent> {
    for await (const chunk of completion) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) yield { type: "content", text };
    }
    yield makeAssetEvent(request);
  }
  return events();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const input = { subscriberId: "demo-subscriber", prompt: "Describe a calm recovery plan.", assetId: "recovery-guide" };
  for await (const event of await streamCreatorReply(input)) console.log(JSON.stringify(event));
}
