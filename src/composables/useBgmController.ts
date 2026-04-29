import { ref } from 'vue'
import startBgmSrc from '../assets/audio/bgm-start.mp3'
import victoryBgmSrc from '../assets/audio/bgm-victory.mp3'
import failBgmSrc from '../assets/audio/bgm-fail.mp3'
import type { AudioLike, BgmControllerLike, BgmState, StorageLike } from '../types/game'

const STORAGE_KEY = 'forest-secret-adventure-muted'

type TrackName = 'start' | 'victory' | 'fail'

interface CreateBgmControllerOptions {
  storage?: StorageLike
  audioFactory?: (src: string) => AudioLike
  fadeInMs?: Partial<Record<TrackName, number>>
  fadeOutMs?: Partial<Record<TrackName, number>>
}

function getDefaultStorage(): StorageLike | undefined {
  if (typeof window === 'undefined' || !window.localStorage) {
    return undefined
  }

  return window.localStorage
}

function getDefaultAudioFactory() {
  if (typeof Audio === 'undefined') {
    return undefined
  }

  return (src: string) => new Audio(src)
}

function fadeVolume(track: AudioLike, target: number, durationMs: number) {
  if (durationMs <= 0) {
    track.volume = target
    return
  }

  const steps = 10
  const startVolume = track.volume
  const delta = target - startVolume
  const intervalMs = Math.max(16, Math.floor(durationMs / steps))
  let step = 0

  const timer = globalThis.setInterval(() => {
    step += 1
    track.volume = Math.min(1, Math.max(0, startVolume + (delta * step) / steps))

    if (step >= steps) {
      globalThis.clearInterval(timer)
      track.volume = target
    }
  }, intervalMs)
}

function getTransitionFadeOutMs(next: TrackName | null) {
  if (next === 'victory') {
    return 800
  }

  if (next === 'fail') {
    return 400
  }

  return 500
}

export function createBgmController(
  options: CreateBgmControllerOptions = {}
): BgmControllerLike {
  const storage = options.storage ?? getDefaultStorage()
  const audioFactory = options.audioFactory ?? getDefaultAudioFactory()
  const audioMuted = ref(storage?.getItem(STORAGE_KEY) === 'true')
  const bgmState = ref<BgmState>('idle')
  const tracks = new Map<TrackName, AudioLike>()
  let activeTrack: TrackName | null = null

  const sources: Record<TrackName, string> = {
    start: startBgmSrc,
    victory: victoryBgmSrc,
    fail: failBgmSrc
  }

  function getTrack(name: TrackName) {
    if (!audioFactory) {
      return null
    }

    const existing = tracks.get(name)
    if (existing) {
      return existing
    }

    const track = audioFactory(sources[name])
    track.loop = name === 'start'
    track.volume = 0
    track.muted = audioMuted.value
    track.currentTime = 0
    tracks.set(name, track)
    return track
  }

  function applyMutedState() {
    for (const track of tracks.values()) {
      track.muted = audioMuted.value
    }
  }

  function stopTrack(name: TrackName, fadeOutOverride?: number) {
    const track = tracks.get(name)

    if (!track) {
      return
    }

    const fadeOut = fadeOutOverride ?? options.fadeOutMs?.[name] ?? 500
    fadeVolume(track, 0, fadeOut)
    globalThis.setTimeout(() => {
      track.pause()
      track.currentTime = 0
      track.volume = 0
    }, fadeOut)
  }

  function playTrack(name: TrackName) {
    const track = getTrack(name)

    if (!track) {
      return
    }

    track.loop = name === 'start'
    track.muted = audioMuted.value
    track.currentTime = 0
    track.volume = 0
    Promise.resolve(track.play()).catch(() => undefined)
    fadeVolume(track, 1, options.fadeInMs?.[name] ?? 800)
  }

  function switchTrack(next: TrackName | null) {
    if (activeTrack && activeTrack !== next) {
      stopTrack(activeTrack, getTransitionFadeOutMs(next))
    }

    if (!next) {
      activeTrack = null
      bgmState.value = 'idle'
      return
    }

    activeTrack = next
    bgmState.value = next
    playTrack(next)
  }

  return {
    audioMuted,
    bgmState,
    startAdventure() {
      switchTrack('start')
    },
    playEnding(kind) {
      switchTrack(kind)
    },
    resetToIdle() {
      switchTrack(null)
    },
    stopAll() {
      switchTrack(null)
    },
    toggleMuted() {
      audioMuted.value = !audioMuted.value
      storage?.setItem(STORAGE_KEY, String(audioMuted.value))
      applyMutedState()
    }
  }
}

export function useBgmController() {
  return createBgmController({
    fadeInMs: {
      start: 1500,
      victory: 800,
      fail: 400
    },
    fadeOutMs: {
      start: 500,
      victory: 500,
      fail: 500
    }
  })
}
