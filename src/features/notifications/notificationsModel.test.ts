import { audienceLabel, buildAudience, compareVersions } from './notificationsModel'

describe('audience', () => {
  test('buildAudience leaves out empty lists', () => {
    const f = { versions: ['3.0.0'], platforms: [], statuses: [] }
    expect(buildAudience('all', f, [])).toBeUndefined()
    expect(buildAudience('filter', f, [])).toEqual({ versions: ['3.0.0'] })
    expect(buildAudience('filter', { versions: [], platforms: [], statuses: [] }, [])).toEqual({})
    expect(buildAudience('users', f, ['a'])).toEqual({ user_ids: ['a'] })
  })

  test('compareVersions: newest first, unknown last', () => {
    expect(['3.0.0', 'unknown', '3.10.0', '3.9.1'].sort(compareVersions)).toEqual([
      '3.10.0',
      '3.9.1',
      '3.0.0',
      'unknown',
    ])
  })

  test('audienceLabel', () => {
    expect(audienceLabel(null)).toBe('All users')
    expect(audienceLabel({})).toBe('All signed-in users')
    expect(audienceLabel({ user_ids: ['a', 'b'] })).toBe('2 chosen users')
    expect(audienceLabel({ versions: ['3.0.0'], platforms: ['ios'], statuses: ['active'] })).toBe(
      'Signed-in · v3.0.0 · iOS · Premium',
    )
  })
})
