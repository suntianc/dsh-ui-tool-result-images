# dsh-ui-tool-result-images

> **Unreleased checkout compatibility:** This checkout targets DSH `0.2.0-rc.2` as its minimum and tested development baseline. Use compatible older plugin versions for older DSH Hosts. See [verification](docs/dsh-source-verification.md).

English | [中文](README.zh.md)

Release: **v0.1.0-rc.2** (npm tag: `rc`).

A plugin-only repair for DeepSeek Harness Web. It keeps raster images returned by successful tools visible after a completed Turn's execution process collapses in Compact transcript mode.

## Unreleased: DSH 0.2.0-rc.2 adaptation

Revalidates the unchanged V4 Tool-result image attachment, Conversation projection, keyed Chat renderer, and gallery contracts against the official rc2 source. Adds text-only, empty, independently failed-result, and renderer remount regression tests. The dependency graph, peer minimum, lockfile, and tagged-source verification now target rc2. This checkout has not been published; the release and npm installation examples below describe the previous rc1-compatible artifact. Live Web/Desktop profiles are not part of the automated checks.

## 0.1.0-rc.2: DSH 0.2.0-rc.1 adaptation

This release updates the DSH dependency graph and reads successful V4 role `tool` messages with direct image content in durable Session events. It keeps the existing public Conversation slot and gallery presentation. Complete package and tagged-source checks pass; a live browser profile has not been tested.

## 0.1.0-rc.1: DSH 0.1.5-rc.1 adaptation

Targets DSH `0.1.5-rc.1`. Image promotion continues through the public `conversation.chat.node` renderer and standard gallery despite the upstream top-level move to `main.conversation`.

Moves the development baseline to DSH `0.1.5-rc.1` and tests V3 replacement ranges using `startSeq` / `endSeq`. Completed-turn image promotion continues through the public Conversation projection and standard image gallery.

## Behavior

The browser plugin derives one replayable image-result node from durable Session events. It collects image attachment references from successful append-origin `tool/result` events, deduplicates them by attachment identity in first-seen order, and publishes the node only after `turn/end`. The node is anchored after the final answer, so Compact presentation may still collapse detailed Tool execution while the image gallery remains a first-class Turn output.

Rendering delegates to the existing `conversation.message.images` implementation. The plugin does not copy image bytes, mint URLs, inspect the DOM, modify model history, or replace Tool cards.

## Compatibility

The tested baseline is DeepSeek Harness `0.2.0-rc.2`, Cordis `4.0.4`, and React 18. The Web profile must include the standard Conversation, Chat, renderer, and attachment UI plugins.

## Install

Stop `dsh web`, ensure the target Host uses a coherent DSH `0.2.0-rc.1` graph, then install this exact prerelease into the intended profile:

```sh
dsh --version
dsh plugin --profile web add dsh-ui-tool-result-images@0.1.0-rc.2
dsh plugin --profile web list
```

Verify the entry, restart `dsh web`, and refresh the browser. This version uses the npm `rc` tag. An install without a version or tag selects `latest`, which does not include this DSH 0.2 adaptation. Older DSH Hosts should retain a compatible older plugin release.

## Development

```sh
pnpm install
pnpm run check
```

The package is an out-of-tree DSH bundle. Its `cordis.patch.yml` inserts the Host anchor whose `dsh.client` declaration loads the browser plugin.

## Known limitations

- Only durable raster `image` blocks in successful append-origin Tool results are promoted.
- The plugin intentionally leaves the original Tool result card unchanged for process inspection and audit.
- It targets the current Compact transcript semantics of DSH `0.2.0-rc.1`; a future core release that natively promotes image Tool results may make this plugin redundant.
