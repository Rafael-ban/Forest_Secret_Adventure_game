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

function createController(storage = new FakeStorage(), audios: FakeAudio[] = []) {
  return createBgmController({
    audioFactory: () => {
      const audio = new FakeAudio()
      audios.push(audio)
      return audio
    },
    storage,
    fadeInMs: {
      home: 0,
      prologue: 0,
      departure: 0,
      investigation: 0,
      revelation: 0,
      danger: 0,
      finale: 0,
      victory: 0,
      hidden: 0,
      fail: 0
    },
    fadeOutMs: {
      home: 0,
      prologue: 0,
      departure: 0,
      investigation: 0,
      revelation: 0,
      danger: 0,
      finale: 0,
      victory: 0,
      hidden: 0,
      fail: 0
    }
  })
}

describe('createBgmController', () => {
  it('starts idle before any user-triggered playback', () => {
    const controller = createController()

    expect(controller.bgmState.value).toBe('idle')
  })

  it('plays looping exploration cues without restarting the same cue', () => {
    const audios: FakeAudio[] = []
    const controller = createController(new FakeStorage(), audios)

    controller.playCue('home')
    controller.playCue('prologue')
    controller.playCue('danger')
    controller.playCue('danger')

    expect(controller.bgmState.value).toBe('danger')
    expect(audios[0]?.loop).toBe(true)
    expect(audios[1]?.loop).toBe(true)
    expect(audios[2]?.loop).toBe(true)
    expect(audios[2]?.playCalls).toBe(1)
  })

  it('plays hidden ending music without loop mode', () => {
    const audios: FakeAudio[] = []
    const controller = createController(new FakeStorage(), audios)

    controller.playCue('hidden')

    expect(controller.bgmState.value).toBe('hidden')
    expect(audios[0]?.loop).toBe(false)
  })

  it('plays fail music without loop mode', () => {
    const audios: FakeAudio[] = []
    const controller = createController(new FakeStorage(), audios)

    controller.playCue('fail')

    expect(controller.bgmState.value).toBe('fail')
    expect(audios[0]?.loop).toBe(false)
  })

  it('persists the mute toggle', () => {
    const storage = new FakeStorage()
    const controller = createController(storage)

    controller.toggleMuted()

    expect(controller.audioMuted.value).toBe(true)
    expect(storage.getItem('forest-secret-adventure-muted')).toBe('true')
  })

  it('restores the mute preference from storage after refresh', () => {
    const storage = new FakeStorage()
    storage.setItem('forest-secret-adventure-muted', 'true')

    const controller = createController(storage)

    expect(controller.audioMuted.value).toBe(true)
  })

  it('resets to idle when requested', () => {
    const controller = createController()

    controller.playCue('victory')
    controller.resetToIdle()

    expect(controller.bgmState.value).toBe('idle')
  })
})
