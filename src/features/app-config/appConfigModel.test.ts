import {
  FIELDS,
  fieldError,
  ordinal,
  parseNumberInput,
  saveLabel,
  type NumberField,
} from './appConfigModel'

const field = (key: string) => FIELDS.find((f) => f.key === key)!
const lessons = field('lesson_interstitial_every') as NumberField

describe('appConfigModel', () => {
  it('ordinals', () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 112].map(ordinal)).toEqual([
      '1st',
      '2nd',
      '3rd',
      '4th',
      '11th',
      '12th',
      '13th',
      '21st',
      '22nd',
      '112th',
    ])
  })

  it('notes: 0 turns things off', () => {
    expect(lessons.note(0)).toBe('Off · no full-screen ads')
    expect(lessons.note(1)).toBe('Ad on every lesson opened')
    expect(lessons.note(3)).toBe('Ad on every 3rd lesson opened')
    expect((field('answer_trial_days') as NumberField).note(0)).toBe('No trial')
    expect((field('lesson_preview_cards') as NumberField).note(1)).toBe('First 1 card free')
    expect((field('lesson_preview_cards') as NumberField).note(0)).toBe('Lessons fully locked')
  })

  it('number input keeps digits and clamps', () => {
    expect(parseNumberInput('', lessons)).toBe(0)
    expect(parseNumberInput('7a', lessons)).toBe(7)
    expect(parseNumberInput('99', lessons)).toBe(20)
  })

  it('validates like the server', () => {
    expect(fieldError(field('privacy_url'), 'https://example.com/p')).toBe('')
    expect(fieldError(field('privacy_url'), 'http://example.com')).toBe(
      'Must be a full https:// link',
    )
    expect(fieldError(field('terms_url'), 'https://nodot')).not.toBe('')
    expect(fieldError(lessons, 21)).not.toBe('')
    expect(fieldError(lessons, 20)).toBe('')
  })

  it('save label', () => {
    expect(saveLabel(0, false)).toBe('Saved')
    expect(saveLabel(2, true)).toBe('Fix errors to save')
    expect(saveLabel(1, false)).toBe('Save 1 change')
    expect(saveLabel(3, false)).toBe('Save 3 changes')
  })
})
