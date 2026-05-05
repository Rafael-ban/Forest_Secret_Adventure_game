import { describe, expect, it } from 'vitest'
import { bgmSources } from './audio'

describe('bgmSources', () => {
  it('covers every active cue with a non-empty asset path', () => {
    expect(Object.keys(bgmSources).sort()).toEqual([
      'danger',
      'departure',
      'fail',
      'finale',
      'hidden',
      'home',
      'investigation',
      'prologue',
      'revelation',
      'victory'
    ])

    for (const source of Object.values(bgmSources)) {
      expect(source).toBeTruthy()
      expect(source.endsWith('.mp3')).toBe(true)
    }
  })
})
