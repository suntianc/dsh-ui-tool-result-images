# dsh-ui-tool-result-images

English | [中文](README.zh.md)

A plugin-only repair for DeepSeek Harness Web `0.1.2-alpha.5`. It keeps raster images returned by successful tools visible after a completed Turn's execution process collapses in Compact transcript mode.

## Behavior

The browser plugin derives one replayable image-result node from durable Session events. It collects image attachment references from successful append-origin `tool/result` events, deduplicates them by attachment identity in first-seen order, and publishes the node only after `turn/end`. The node is anchored after the final answer, so Compact presentation may still collapse detailed Tool execution while the image gallery remains a first-class Turn output.

Rendering delegates to the existing `conversation.message.images` implementation. The plugin does not copy image bytes, mint URLs, inspect the DOM, modify model history, or replace Tool cards.

## Compatibility

The tested baseline is DeepSeek Harness `0.1.2-alpha.5`, Cordis `4.0.2`, and React 18. The Web profile must include the standard Conversation, Chat, renderer, and attachment UI plugins.

## Development

```sh
pnpm install
pnpm run check
```

The package is an out-of-tree DSH bundle. Its `cordis.patch.yml` inserts the Host anchor whose `dsh.client` declaration loads the browser plugin.

## Known limitations

- Only durable raster `image` blocks in successful append-origin Tool results are promoted.
- The plugin intentionally leaves the original Tool result card unchanged for process inspection and audit.
- It targets the current Compact transcript semantics of DSH `0.1.2-alpha.5`; a future core release that natively promotes image Tool results may make this plugin redundant.
