import { ref } from 'vue'
import { bgmSources } from '../data/audio'
import type { AudioLike, BgmControllerLike, BgmCue, BgmState, StorageLike } from '../types/game'

const STORAGE_KEY = 'forest-secret-adventure-muted'

const LOOPING_CUES = new Set<BgmCue>([
  'home',
  'prologue',
  'departure',
  'investigation',
  'revelation',
  'danger',
  'finale'
])

interface CreateBgmControllerOptions {
  storage?: StorageLike
  audioFactory?: (src: string) => AudioLike
  fadeInMs?: Partial<Record<BgmCue, number>>
  fadeOutMs?: Partial<Record<BgmCue, number>>
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

function getTransitionFadeOutMs(next: BgmCue | null) {
  if (next === 'fail') {
    return 400
  }

  if (next === 'victory' || next === 'hidden') {
    return 800
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
  const tracks = new Map<BgmCue, AudioLike>()
  let activeTrack: BgmCue | null = null

  function getTrack(name: BgmCue) {
    if (!audioFactory) {
      return null
    }

    const existing = tracks.get(name)
    if (existing) {
      return existing
    }

    const track = audioFactory(bgmSources[name])
    track.loop = LOOPING_CUES.has(name)
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

  function stopTrack(name: BgmCue, fadeOutOverride?: number) {
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

  function stopAllTracks() {
    for (const [name] of tracks) {
      stopTrack(name, 0)
    }
  }

  function playTrack(name: BgmCue) {
    const track = getTrack(name)

    if (!track) {
      return
    }

    track.loop = LOOPING_CUES.has(name)
    track.muted = audioMuted.value
    track.currentTime = 0
    track.volume = 0
    Promise.resolve(track.play()).catch(() => undefined)
    fadeVolume(track, 1, options.fadeInMs?.[name] ?? 800)
  }

  function switchTrack(next: BgmCue | null) {
    if (next && activeTrack === next) {
      bgmState.value = next
      return
    }

    if (activeTrack) {
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
    playCue(cue) {
      switchTrack(cue)
    },
    resetToIdle() {
      stopAllTracks()
      activeTrack = null
      bgmState.value = 'idle'
    },
    stopAll() {
      stopAllTracks()
      activeTrack = null
      bgmState.value = 'idle'
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
      home: 1200,
      prologue: 800,
      departure: 800,
      investigation: 800,
      revelation: 800,
      danger: 800,
      finale: 800,
      victory: 800,
      hidden: 800,
      fail: 400
    },
    fadeOutMs: {
      home: 500,
      prologue: 500,
      departure: 500,
      investigation: 500,
      revelation: 500,
      danger: 500,
      finale: 500,
      victory: 500,
      hidden: 500,
      fail: 500
    }
  })
}
