# opencode-subagent-policy

An OpenCode V2 plugin that keeps sub-agents off expensive Console models. A session whose agent is a subagent may not dispatch a model request through a blocked provider; the main session is unaffected.

## The rule

| | |
| --- | --- |
| Blocked for subagents | `console-anthropic` |
| Everything else | unchanged |

Subagent identity is read from the agent registry: `mode: "subagent"` or `mode: "all"`. The registry is refreshed on the `agent.updated` event and once a minute.

The check runs on the `session.hook("context")` seam, immediately before dispatch, so it costs nothing when the model is allowed and no request reaches the provider when it is not.

## Rejection

The error names the offending model and lists the models the Console still offers, so the caller can retry on one that is permitted:

```text
Sub-agents may not use console-anthropic models (got console-anthropic/claude-haiku-5-5).
Enabled Console models: opencode/beam-free, opencode/big-pickle, opencode/deepseek-v4.1-flash, …
```

The list is the local catalog restricted to the `opencode` provider. `opencode-go` is deliberately ignored: the Console serves no model enablement for that provider, so it is not part of the Console catalogue this plugin reports.

## Install

The plugin loads from `~/.config/opencode/plugins/`. Point it at this checkout:

```sh
ln -sfn ~/work/playground/opencode-subagent-policy ~/.config/opencode/plugins/subagent-policy
```

A running server only discovers plugin directories at location boot, so restart it once:

```sh
opencode service restart
```

## Develop

```sh
bun install
bun test
bunx tsc --noEmit
```

`src/policy.ts` holds the pure decisions and the test file covers them; `src/index.ts` is the plugin wiring.
