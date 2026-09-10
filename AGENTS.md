# dsh-ui-tool-result-images Agent Guide

This file supplements the workspace-level `AGENTS.md`. The workspace guide remains authoritative for shared plugin, Git, verification, and delivery rules.

## Project identity

- Command target: `dsh-ui-tool-result-images`
- Local development root: `/Users/suntc/project/dsh-plugins/dsh-ui-tool-result-images`
- Canonical Git origin: `git@github.com:suntianc/dsh-ui-tool-result-images.git`
- GitHub repository: `https://github.com/suntianc/dsh-ui-tool-result-images`
- Issue tracker: `https://github.com/suntianc/dsh-ui-tool-result-images/issues`
- Local task record: `docs/issue-tracker.md`

The repository is initialized locally. Do not create the remote repository, commit, push, publish, or change visibility unless the user explicitly requests that separate action.

## Purpose and scope

This plugin keeps successful image-bearing Tool results visible in DeepSeek Harness Web after a completed Turn enters Compact transcript presentation. It must use only public DSH Client seams: Conversation Node definitions, keyed Chat renderers, and the existing message-image renderer. It must not patch DSH core, installed packages, generated bundles, DOM selectors, or user data.

## Compatibility baseline

- Target DSH package baseline: `0.1.5-rc.1`.
- DSH peer ranges use `^0.1.5-rc.1`; development dependencies pin `0.1.5-rc.1`.
- Cordis peer range uses `^4.0.2`; development pins `4.0.2`.
- Client bundles may import runtime values only from modules supplied by the Web module table. Other DSH imports must be type-only or reached through injected public services.

## Required workflow

1. Verify the Git root and canonical origin before repository-affecting work.
2. Read `docs/issue-tracker.md`, package metadata, both READMEs, `cordis.patch.yml`, and relevant tests before behavior changes.
3. Preserve the approved test seams: durable Session events to a Turn image node; node data to the existing gallery renderer; installed Compact GUI behavior.
4. Follow red-green TDD one vertical slice at a time.
5. Run the narrow test during development and `pnpm run check` before handoff.
6. Installing into or changing a live DSH profile requires explicit authorization. The originating conversation authorized installation into the current Web profile solely for verification of this task.

## Matching source verification

DSH `0.1.5-rc.1` at `183f08e9c6dde7e36cd2318eaee70b0da08fb35e` is the matching source target for the published npm baseline. Use the isolated workflow in `docs/dsh-source-verification.md`; run both `pnpm run check` and the source check when changing compatibility-sensitive behavior. Keep the complete dependency graph coherent. Older release graphs are historical evidence, not the current development baseline.
