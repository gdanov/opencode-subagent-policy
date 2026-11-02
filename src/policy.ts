export interface ModelRef {
  readonly providerID: string
  readonly id: string
}

export interface AgentRef {
  readonly id: string
  readonly mode?: string
}

/** Providers whose models sub-agents may not use. */
export const blockedProviders: readonly string[] = ['console-anthropic']

/** Providers named in the rejection hint: the Console's own catalogue, deliberately without `opencode-go`. */
export const hintProviders: readonly string[] = ['opencode']

export const blocksModel = (providerID: string): boolean => blockedProviders.includes(providerID)

/** `all` means the agent is usable both ways, so it counts as a sub-agent. */
export const isSubagentAgent = (agent: AgentRef): boolean => agent.mode === 'subagent' || agent.mode === 'all'

export const subagentIDs = (agents: readonly AgentRef[]): string[] => agents.filter(isSubagentAgent).map((agent) => agent.id)

export const enabledModels = (models: readonly ModelRef[]): string[] =>
  models
    .filter((model) => hintProviders.includes(model.providerID))
    .map((model) => `${model.providerID}/${model.id}`)
    .sort()
