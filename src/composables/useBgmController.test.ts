import { describe, expect, it } from 'vitest'
import { createBgmController } from './useBgmController'
import type { AudioLike, StorageLike } from '../types/game'

class FakeAudio implements AudioLike {
  loop = false
  volume = 1
  muted = false
  currentTime = 0
  playCalls = 0
  pauseCalls = 0

  play() {
    this.playCalls += 1
    return Promise.resolve()
  }

  pause() {
    this.pauseCalls += 1
  }
}

class FakeStorage implements StorageLike {
  private values = new Map<string, string>()

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

describe('createBgmController', () => {
  it('starts the adventure bgm in loop mode', () => {
    const audios: FakeAudio[] = []
    const controller = createBgmController({
      audioFactory: () => {
        const audio = new FakeAudio()
        audios.push(audio)
        return audio
      },
      storage: new FakeStorage(),
      fadeInMs: { start: 0, victory: 0, fail: 0 },
      fadeOutMs: { start: 0, victory: 0, fail: 0 }
    })

    controller.startAdventure()

    expect(controller.bgmState.value).toBe('start')
    expect(audios[0]?.loop).toBe(true)
    expect(audios[0]?.playCalls).toBe(1)
  })

  it('switches to victory music for positive endings', () => {
    const controller = createBgmController({
      audioFactory: () => new FakeAudio(),
      storage: new FakeStorage(),
      fadeInMs: { start: 0, victory: 0, fail: 0 },
      fadeOutMs: { start: 0, victory: 0, fail: 0 }
    })

    controller.startAdventure()
    controller.playEnding('victory')

    expect(controller.bgmState.value).toBe('victory')
  })

  it('persists the mute toggle', () => {
    const storage = new FakeStorage()
    const controller = createBgmController({
      audioFactory: () => new FakeAudio(),
      storage,
      fadeInMs: { start: 0, victory: 0, fail: 0 },
      fadeOutMs: { start: 0, victory: 0, fail: 0 }
    })

    controller.toggleMuted()

    expect(controller.audioMuted.value).toBe(true)
    expect(storage.getItem('forest-secret-adventure-muted')).toBe('true')
  })

  it('restores the mute preference from storage after refresh', () => {
    const storage = new FakeStorage()
    storage.setItem('forest-secret-adventure-muted', 'true')

    const controller = createBgmController({
      audioFactory: () => new FakeAudio(),
      storage,
      fadeInMs: { start: 0, victory: 0, fail: 0 },
      fadeOutMs: { start: 0, victory: 0, fail: 0 }
    })

    expect(controller.audioMuted.value).toBe(true)
  })

  it('switches to fail music for failed endings', () => {
    const controller = createBgmController({
      audioFactory: () => new FakeAudio(),
      storage: new FakeStorage(),
      fadeInMs: { start: 0, victory: 0, fail: 0 },
      fadeOutMs: { start: 0, victory: 0, fail: 0 }
    })

    controller.startAdventure()
    controller.playEnding('fail')

    expect(controller.bgmState.value).toBe('fail')
  })
})
