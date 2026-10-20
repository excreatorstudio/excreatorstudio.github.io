import assert from "node:assert/strict";
import test from "node:test";
import { stat } from "node:fs/promises";
import { createStaticPreview } from "../scripts/editing-academy-preview.mjs";

test("local static preview serves correct video MIME, HEAD and byte ranges for native playback/seek", async () => {
  const server = createStaticPreview("out");
  await new Promise(done => server.listen(0, "127.0.0.1", done));
  try {
    const url = `http://127.0.0.1:${server.address().port}/media/editing-handbook/intro-24s.web.mp4`;
    const size = (await stat("out/media/editing-handbook/intro-24s.web.mp4")).size;
    const head = await fetch(url, { method: "HEAD" });
    assert.equal(head.status, 200);
    assert.equal(head.headers.get("content-type"), "video/mp4");
    assert.equal(Number(head.headers.get("content-length")), size);
    const range = await fetch(url, { headers: { Range: "bytes=0-63" } });
    assert.equal(range.status, 206);
    assert.equal(range.headers.get("content-range"), `bytes 0-63/${size}`);
    assert.equal((await range.arrayBuffer()).byteLength, 64);
    const invalid = await fetch(url, { headers: { Range: `bytes=${size + 1}-` } });
    assert.equal(invalid.status, 416);
  } finally { server.closeAllConnections(); await new Promise(done => server.close(done)); }
});
