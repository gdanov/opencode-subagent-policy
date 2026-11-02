import { describe, expect, test } from 'bun:test'

import { blocksModel, enabledModels, isSubagentAgent, subagentIDs } from '../src/policy'

describe('blocksModel', () => {
  test('blocks console-anthropic only', () => {
    expect(blocksModel('console-anthropic')).toBe(true)
    expect(blocksModel('opencode')).toBe(false)
    expect(blocksModel('opencode-go')).toBe(false)
    expect(blocksModel('openrouter')).toBe(false)
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

describe('enabledModels', () => {
  const catalog = [
    { providerID: 'opencode', id: 'glm-5.3-flash' },
    { providerID: 'opencode', id: 'beam-free' },
    { providerID: 'console-anthropic', id: 'claude-opus-5-5' },
    { providerID: 'opencode-go', id: 'gpt-6-luna' },
    { providerID: 'openrouter', id: 'anthropic/claude-sonnet-5.5' },
  ]

  test('lists the console catalogue without opencode-go, console-anthropic or third-party providers', () => {
    expect(enabledModels(catalog)).toEqual(['opencode/beam-free', 'opencode/glm-5.3-flash'])
  })
})
