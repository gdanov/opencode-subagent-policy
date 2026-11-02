import { Plugin } from '@opencode/plugin'

import { enabledModels, isAllowedModel, subagentIDs, type ModelRef } from './policy'

const agentRefreshInterval = 60_000

export default Plugin.define({
  id: 'subagent-policy',
  async setup(ctx) {
    let subagents = new Set<string>()

    const refreshAgents = async () => {
      subagents = new Set(subagentIDs((await ctx.agent.list()).data))
    }

    await refreshAgents()

    const registration = await ctx.session.hook('context', async (event) => {
      if (!subagents.has(event.agent)) return

      const allowed = enabledModels((await ctx.model.list()).data as readonly ModelRef[])
      if (isAllowedModel(event.model, allowed)) return

      throw new Error(
        `Sub-agents may only run an enabled model (got ${event.model.providerID}/${event.model.id}). ` +
          `Enabled Console models: ${allowed.length > 0 ? allowed.join(', ') : 'none'}.`,
      )
    })

    const controller = new AbortController()
    void (async () => {
      for await (const event of ctx.event.subscribe({ types: ['agent.updated'], signal: controller.signal })) {
        if (event.type === 'agent.updated') await refreshAgents()
      }
    })().catch((cause: unknown) => {
      if (!controller.signal.aborted) console.error(`[subagent-policy] agent subscription failed: ${String(cause)}`)
    })

    const timer = setInterval(() => void refreshAgents(), agentRefreshInterval)

    return () => {
      controller.abort()
      clearInterval(timer)
      return registration.dispose()
    }
  },
})
