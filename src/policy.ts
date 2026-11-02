export interface ModelRef {
  readonly providerID: string
  readonly id: string
}

export interface AgentRef {
  readonly id: string
  readonly mode?: string
}

/** Providers whose catalogue defines what a sub-agent may run. */
export const catalogueProviders: readonly string[] = ['opencode']

/** The bare model name: no provider prefix and no variant suffix. */
export const modelName = (model: ModelRef): string => {
  const prefix = `${model.providerID}/`
  const id = model.id.startsWith(prefix) ? model.id.slice(prefix.length) : model.id
  return id.split('#')[0] ?? id
}

/** `all` means the agent is usable both ways, so it counts as a sub-agent. */
export const isSubagentAgent = (agent: AgentRef): boolean => agent.mode === 'subagent' || agent.mode === 'all'

export const subagentIDs = (agents: readonly AgentRef[]): string[] => agents.filter(isSubagentAgent).map((agent) => agent.id)

/** The enabled model names, bare and deduplicated. */
export const enabledModels = (models: readonly ModelRef[]): string[] =>
  [
    ...new Set(
      models.filter((model) => catalogueProviders.includes(model.providerID)).map(modelName),
    ),
  ].sort()

/** Whether a model's name is on the enabled list, by provider-independent regex match. */
export const isAllowedModel = (model: ModelRef, allowed: readonly string[]): boolean =>
  allowed.length > 0 && allowedPattern(allowed).test(modelName(model))

const allowedPattern = (allowed: readonly string[]): RegExp =>
  new RegExp(`^(?:${allowed.map(escapeRegExp).join('|')})$`)

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
