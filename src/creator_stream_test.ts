import assert from "node:assert/strict";
import { creatorRequest, makeAssetEvent } from "./creator_stream_service.js";

const request = creatorRequest.parse({ subscriberId: "sub-7", prompt: "A short update", assetId: "asset-2" });
assert.deepEqual(makeAssetEvent(request), { type: "asset-ready", assetId: "asset-2", subscriberId: "sub-7" });
assert.throws(() => creatorRequest.parse({ subscriberId: "", prompt: "", assetId: "asset-2" }));
console.log("creator request boundary: ok");
