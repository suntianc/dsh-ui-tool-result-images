# Changelog

## [0.1.0-rc.1] - 2026-09-10

- Targets DSH `0.1.5-rc.1`. Image promotion continues through the public `conversation.chat.node` renderer and standard gallery despite the upstream top-level move to `main.conversation`.
- Moves the development baseline to DSH `0.1.5-rc.1` and tests V3 replacement ranges using `startSeq` / `endSeq`. Completed-turn image promotion continues through the public Conversation projection and standard image gallery.

## [0.1.0-alpha.6] - 2026-09-07

- Add explicit DSH `0.1.3-alpha.1` source compatibility alongside the npm alpha.5 baseline; keep dependency graphs separate.
- Add reproducible isolated source-package checks and coherent lockfile validation.
- Update the durable assistant fixture for Session v2 while retaining Compact image promotion.

## [0.1.0-alpha.5] - 2026-09-03

### Added

- Initial plugin-only projection that keeps successful image Tool results visible in Compact Web transcripts.
