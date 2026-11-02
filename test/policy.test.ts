import { describe, expect, test } from 'bun:test'

import { enabledModels, isAllowedModel, isSubagentAgent, modelName, subagentIDs } from '../src/policy'

describe('modelName', () => {
  test('drops the provider prefix and the variant suffix', () => {
    expect(modelName({ providerID: 'opencode-go', id: 'deepseek-v4.1-flash' })).toBe('deepseek-v4.1-flash')
    expect(modelName({ providerID: 'opencode', id: 'opencode/glm-5.3-flash' })).toBe('glm-5.3-flash')
    expect(modelName({ providerID: 'opencode-go', id: 'deepseek-v4.1-flash#high' })).toBe('deepseek-v4.1-flash')
  })
})

describe('enabledModels', () => {
  const catalogue = [
    { providerID: 'opencode', id: 'glm-5.3-flash' },
    { providerID: 'opencode', id: 'beam-free' },
    { providerID: 'opencode', id: 'beam-free' },
    { providerID: 'console-anthropic', id: 'claude-opus-5-5' },
    { providerID: 'opencode-go', id: 'gpt-6-luna' },
    { providerID: 'openrouter', id: 'anthropic/claude-sonnet-5.5' },
  ]

  test('lists bare catalog names, deduplicated and sorted', () => {
    expect(enabledModels(catalogue)).toEqual(['beam-free', 'glm-5.3-flash'])
  })
})

describe('isAllowedModel', () => {
  const allowed = ['beam-free', 'deepseek-v4.1-flash']

  test('matches a name regardless of the provider that serves it', () => {
    expect(isAllowedModel({ providerID: 'opencode-go', id: 'deepseek-v4.1-flash' }, allowed)).toBe(true)
    expect(isAllowedModel({ providerID: 'opencode', id: 'beam-free' }, allowed)).toBe(true)
  })

  test('rejects a name that is not on the list', () => {
    expect(isAllowedModel({ providerID: 'opencode-go', id: 'deepseek-v4-pro' }, allowed)).toBe(false)
    expect(isAllowedModel({ providerID: 'console-anthropic', id: 'claude-opus-5-5' }, allowed)).toBe(false)
    expect(isAllowedModel({ providerID: 'openrouter', id: 'anthropic/claude-sonnet-5.5' }, allowed)).toBe(false)
  })

  test('treats catalogue names literally, not as patterns', () => {
    expect(isAllowedModel({ providerID: 'opencode', id: 'deepseek-v4x1-flash' }, allowed)).toBe(false)
  })

  test('an empty catalogue allows nothing', () => {
    expect(isAllowedModel({ providerID: 'opencode', id: 'beam-free' }, [])).toBe(false)
  })
})

describe('isSubagentAgent', () => {
  test('counts subagents and all-mode agents', () => {
    expect(isSubagentAgent({ id: 'general', mode: 'subagent' })).toBe(true)
    expect(isSubagentAgent({ id: 'custom', mode: 'all' })).toBe(true)
    expect(isSubagentAgent({ id: 'build', mode: 'primary' })).toBe(false)
    expect(isSubagentAgent({ id: 'unknown' })).toBe(false)
  })

  test('collects their ids', () => {
    const agents = [
      { id: 'build', mode: 'primary' },
      { id: 'general', mode: 'subagent' },
      { id: 'reviewer', mode: 'all' },
    ]
    expect(subagentIDs(agents)).toEqual(['general', 'reviewer'])
  })
})
