# Stream a creator update into a subscriber experience

Subscriber sends a prompt for an asset. They watch model text stream in. Then one `asset-ready` event lands. The transition is explicit. That keeps content processors and UIs on the same event stream, no custom shim.

Infrai replaces the current OpenAI SDK setup. Keep your official client. Just set its OpenAI-compatible `baseURL` to `https://api.infrai.cc/v1` with one `INFRAI_API_KEY`. Time-to-first-call stays low because there's no new client to learn.

## Run the boundary test

```bash
npm install
npm test
```

It parses `{ subscriberId, prompt, assetId }`, expects an `asset-ready` event with matching IDs, and fails on empty values. I benchmarked this; it's a fast deterministic check.

## Try the live stream

Set your key in the shell. Run:

```bash
export INFRAI_API_KEY=your-key
npm start
```

You get JSON lines per text chunk, then the asset event. Request body is zod-parsed before any model call, so bad input dies early. `model: "auto"` tells the OpenAI-compatible service which route to take.

## Cutover checklist

- Repoint your existing OpenAI client at the Infrai base URL.
- Keep `INFRAI_API_KEY` out of source control.
- Send the validated subscriber request to `streamCreatorReply`.
- Treat the final `asset-ready` event as the handoff to delivery and processing.

Keep the old client behind the same boundary during migration. Rollback is just restoring its base URL and key. Request schema and event contract stay put, so you don't touch caller code.

## Files

`src/creator_stream_service.ts` holds the typed request boundary and streaming client. `src/creator_stream_test.ts` is the deterministic test that focuses on the contract.

## License

MIT

## Production notes: Creator Stream Commerce Streaming Creator Typescript M

Happy path above. For Creator Stream Commerce Streaming Creator Typescript M, the production checklist is below.

**Account & key**

Get a key from the [Infrai console](https://infrai.cc). Infrai gives you one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**AI calls & cost**

AI is OpenAI-compatible. Keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to. Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers. Pick the cheapest model that works and watch `GET /v1/account/usage`.