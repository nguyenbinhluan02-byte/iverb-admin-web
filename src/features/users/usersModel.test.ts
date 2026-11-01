import { lastActiveLabel, monthLabel, planDate, planSubline, statusNote } from './usersModel'

describe('usersModel', () => {
  it('labels last active in UTC days', () => {
    expect(lastActiveLabel('2026-11-01T23:00:00+00:00', '2026-11-01')).toBe('Today')
    expect(lastActiveLabel('2026-10-31T01:00:00+00:00', '2026-11-01')).toBe('Yesterday')
    expect(lastActiveLabel('2026-10-20T01:00:00+00:00', '2026-11-01')).toBe('12 days ago')
    expect(lastActiveLabel(null, '2026-11-01')).toBe('—')
  })

  it('describes the plan date by status and plan', () => {
    const end = '2027-03-05T00:00:00+00:00'
    expect(planSubline({ status: 'active', plan: 'yearly', plan_expires_at: end })).toBe(
      'Renews Mar 5, 2027',
    )
    expect(planSubline({ status: 'active', plan: 'gift', plan_expires_at: end })).toBe(
      'Ends Mar 5, 2027',
    )
    expect(planSubline({ status: 'expired', plan: 'gift', plan_expires_at: end })).toBe(
      'Ended Mar 5, 2027',
    )
    expect(planDate({ status: 'active', plan: 'lifetime', plan_expires_at: null })).toEqual({
      label: 'Ends',
      value: 'Never',
    })
    expect(planSubline({ status: 'free', plan: null, plan_expires_at: null })).toBe('Never premium')
  })

  it('explains what each status can do', () => {
    expect(statusNote({ status: 'expired', plan_expires_at: '2026-10-01T00:00:00Z' })).toBe(
      'Plan ended Oct 1, 2026. Can read but not answer until renewed.',
    )
    expect(statusNote({ status: 'free', plan_expires_at: null })).toMatch(/never had premium/)
  })

  it('names months', () => {
    expect(monthLabel('2026-10')).toBe('Oct 2026')
    expect(monthLabel('')).toBe('Any month')
  })
})
