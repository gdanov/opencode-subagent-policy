# opencode-subagent-policy

An OpenCode V2 plugin that keeps sub-agents on the Console's enabled models. A session whose agent is a subagent may only dispatch a model whose name is on that list; the main session is unaffected.

## The rule

| | |
| --- | --- |
| Allowed for subagents | a model name in the enabled Console catalogue |
| Rejected | everything else |

The catalogue is the local model list restricted to the `opencode` provider, reduced to bare names: the provider prefix is stripped, so the same model is permitted whichever provider serves it (`opencode-go/deepseek-v4.1-flash` passes because `deepseek-v4.1-flash` is enabled). A variant suffix (`#high`) is stripped. Names are compared as a regex alternation, anchored at both ends, with regex metacharacters escaped, so a catalogue name is matched literally.

Subagent identity is read from the agent registry: `mode: "subagent"` or `mode: "all"`. The registry is refreshed on the `agent.updated` event and once a minute.

The check runs on the `session.hook("context")` seam, immediately before dispatch, so no request reaches the provider when the model is not on the list.

## Rejection

The error names the offending model and lists the enabled names, so the caller can retry on one that is permitted:

```text
Sub-agents may only run an enabled model (got opencode-go/deepseek-v4-pro).
Enabled Console models: beam-free, big-pickle, deepseek-v4.1-flash, …
```

An empty catalogue allows nothing, and the message reads `Enabled Console models: none.`

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
