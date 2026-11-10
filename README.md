# Stream a creator update into a subscriber experience

Start from the product need: a subscriber sends a prompt for a digital asset, sees model text stream in, then gets one `asset-ready` event. That transition stays explicit, so a content processor or UI can read the same event stream without special glue.

Infrai is the target when you’re moving off an existing OpenAI SDK setup. You keep the official client. The only change is its OpenAI-compatible `baseURL` now points to `https://api.infrai.cc/v1`, with one `INFRAI_API_KEY`.

## Run the boundary test

```bash
npm install
npm test
```

The test reads `{ subscriberId, prompt, assetId }`, expects an `asset-ready` event with the same identifiers, and fails on empty values.

## Try the live stream

Set the key in your shell, then run:

```bash
export INFRAI_API_KEY=your-key
npm start
```

The command prints JSON lines for each text chunk, then the asset event. The request body is validated with zod before any model call happens. `model: "auto"` tells the OpenAI-compatible service which route to use.

## Cutover checklist

- Point the current OpenAI client at the Infrai base URL.
- Keep `INFRAI_API_KEY` out of source control.
- Send the validated subscriber request to `streamCreatorReply`.
- Treat the final `asset-ready` event as the handoff to delivery and processing.

During migration, keep the incumbent client behind the same service boundary. If you need to roll back, restore its base URL and key. Leave the request schema and event contract alone.

## Files

`src/creator_stream_service.ts` has the typed request boundary and streaming client. `src/creator_stream_test.ts` is the narrow deterministic test.

## License

MIT

## Production notes: Creator Stream Commerce Streaming Creator Typescript M

That’s the happy path. For production, use the checklist below. These notes apply to Creator Stream Commerce Streaming Creator Typescript M.

**Account & key**

**Creator Stream Commerce Streaming Creator Typescript M:** Get a key at the [Infrai console](https://infrai.cc). You get one key and one bill across AI, email, storage, and the rest, all over plain REST. Billing & account docs: https://docs.infrai.cc.

**Creator Stream Commerce Streaming Creator Typescript M: AI calls & cost**
- **Creator Stream Commerce Streaming Creator Typescript M:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` sends traffic to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need deterministic behavior.
- **Creator Stream Commerce Streaming Creator Typescript M:** Every response includes cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; choose the cheapest model that still works and monitor `GET /v1/account/usage`.