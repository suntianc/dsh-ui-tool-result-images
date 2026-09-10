# dsh-ui-tool-result-images

> **DSH compatibility:** `0.1.0-rc.1` targets DSH `0.1.5-rc.1` as its development and minimum supported baseline, with a coherent dependency graph. Keep compatible older plugin releases for older DSH Hosts. See [verification](docs/dsh-source-verification.md).

English | [中文](README.zh.md)

A plugin-only repair for DeepSeek Harness Web `0.1.5-rc.1`. It keeps raster images returned by successful tools visible after a completed Turn's execution process collapses in Compact transcript mode.

## 0.1.0-rc.1: DSH 0.1.5-rc.1 adaptation

Targets DSH `0.1.5-rc.1`. Image promotion continues through the public `conversation.chat.node` renderer and standard gallery despite the upstream top-level move to `main.conversation`.

Moves the development baseline to DSH `0.1.5-rc.1` and tests V3 replacement ranges using `startSeq` / `endSeq`. Completed-turn image promotion continues through the public Conversation projection and standard image gallery.

## Behavior

The browser plugin derives one replayable image-result node from durable Session events. It collects image attachment references from successful append-origin `tool/result` events, deduplicates them by attachment identity in first-seen order, and publishes the node only after `turn/end`. The node is anchored after the final answer, so Compact presentation may still collapse detailed Tool execution while the image gallery remains a first-class Turn output.

Rendering delegates to the existing `conversation.message.images` implementation. The plugin does not copy image bytes, mint URLs, inspect the DOM, modify model history, or replace Tool cards.

## Compatibility

The tested baseline is DeepSeek Harness `0.1.5-rc.1`, Cordis `4.0.2`, and React 18. The Web profile must include the standard Conversation, Chat, renderer, and attachment UI plugins.

## Install

Stop `dsh web`, ensure the target Host uses a coherent DSH `0.1.5-rc.1` graph, then install the exact prerelease into the intended profile:

```sh
dsh --version
dsh plugin --profile web add dsh-ui-tool-result-images@0.1.0-rc.1
dsh plugin --profile web list
```

Verify the entry, restart `dsh web`, and refresh the browser. This version uses the npm `rc` tag. An install without a version or tag selects `latest`, which does not include this RC1 adaptation. Older DSH Hosts should retain a compatible older plugin release.

## Development

```sh
pnpm install
pnpm run check
```

The package is an out-of-tree DSH bundle. Its `cordis.patch.yml` inserts the Host anchor whose `dsh.client` declaration loads the browser plugin.

## Known limitations

- Only durable raster `image` blocks in successful append-origin Tool results are promoted.
- The plugin intentionally leaves the original Tool result card unchanged for process inspection and audit.
- It targets the current Compact transcript semantics of DSH `0.1.5-rc.1`; a future core release that natively promotes image Tool results may make this plugin redundant.
