# Issue tracker record

Canonical tracker: https://github.com/suntianc/dsh-ui-tool-result-images/issues

No remote issue or repository was created during project initialization. The direct user request in the originating DSH session is the current local source of truth:

> Keep image-bearing Tool results visible after completed Turns fold their Tool process in Compact transcript mode. Add a regression test first, implement the smallest safe plugin-only projection, run package checks, install it into the current Web profile, and verify `http://127.0.0.1:3080` after refresh.

## Confirmed public test seams

1. Durable `turn/start` / successful `tool/result` / `turn/end` events project a deduplicated Turn image node only after closure.
2. The keyed Chat renderer hands those durable image references to the existing message-image gallery.
3. In the installed Web GUI, Compact mode may collapse the Tool process while the projected image gallery remains visible.

## Constraints

- Use public DSH `0.1.2-alpha.5` Client interfaces only.
- Do not edit DeepSeek Harness core, the globally installed package, generated DSH bundles, or neighboring plugins.
- Do not create a remote repository, commit, push, publish, or perform unrelated profile changes.
