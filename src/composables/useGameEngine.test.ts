import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useGameEngine } from './useGameEngine'
import type { BgmControllerLike, BgmState } from '../types/game'

function createFakeBgmController(): BgmControllerLike {
  const audioMuted = ref(false)
  const bgmState = ref<BgmState>('idle')

  return {
    audioMuted,
    bgmState,
    startAdventure() {
      bgmState.value = 'start'
    },
    playEnding(kind) {
      bgmState.value = kind
    },
    resetToIdle() {
      bgmState.value = 'idle'
    },
    stopAll() {
      bgmState.value = 'idle'
    },
    toggleMuted() {
      audioMuted.value = !audioMuted.value
    }
  }
}

describe('useGameEngine', () => {
  it('does not start music before entering the forest', () => {
    const game = useGameEngine({ bgmController: createFakeBgmController() })

    expect(game.state.hasStarted).toBe(false)
    expect(game.state.bgmState).toBe('idle')
  })

  it('starts the adventure and starts the start bgm after the intro click', () => {
    const game = useGameEngine({ bgmController: createFakeBgmController() })

    game.startGame()

    expect(game.state.hasStarted).toBe(true)
    expect(game.state.currentSceneId).toBe('scene1')
    expect(game.state.bgmState).toBe('start')
  })

  it('collects truth clues on the understanding route', () => {
    const game = useGameEngine({ bgmController: createFakeBgmController() })

    game.startGame()
    game.chooseOption('scene1-offer-memory')
    game.chooseOption('scene2-listen-wind')
    game.chooseOption('scene3-ask-reflection')

    expect(game.state.trustForest).toBe(true)
    expect(game.state.truthClueCount).toBe(2)
    expect(game.state.memory).toBe(8)
  })

  it('saves the white deer and obtains the heart seed', () => {
    const game = useGameEngine({ bgmController: createFakeBgmController() })

    game.startGame()
    game.chooseOption('scene1-offer-memory')
    game.chooseOption('scene2-listen-wind')
    game.chooseOption('scene3-ask-reflection')
    game.chooseOption('scene4-follow-lights')
    game.chooseOption('scene5-save-deer')

    expect(game.state.savedWhiteDeer).toBe(true)
    expect(game.state.hasHeartSeed).toBe(true)
    expect(game.state.currentSceneId).toBe('scene6')
  })

  it('fails on the reckless route when trying to renew the pact without enough trust', () => {
    const game = useGameEngine({ bgmController: createFakeBgmController() })

    game.startGame()
    game.chooseOption('scene1-force-entry')
    game.chooseOption('scene2-chase-voice')
    game.chooseOption('scene3-break-mirror')
    game.chooseOption('scene4-shortcut')
    game.chooseOption('scene5-rush-bridge')
    game.chooseOption('scene6-renew-pact')

    expect(game.state.ending).toBe('fail')
    expect(game.state.bgmState).toBe('fail')
    expect(game.currentEnding.value?.reasonSummary?.[0]).toContain('没有同时带着足够的信任')
  })

  it('reaches the hidden ending on the full trust route', () => {
    const game = useGameEngine({ bgmController: createFakeBgmController() })

    game.startGame()
    game.chooseOption('scene1-offer-memory')
    game.chooseOption('scene2-listen-wind')
    game.chooseOption('scene3-ask-reflection')
    game.chooseOption('scene4-follow-lights')
    game.chooseOption('scene5-save-deer')
    game.chooseOption('scene6-renew-pact')

    expect(game.state.ending).toBe('hidden')
    expect(game.state.bgmState).toBe('victory')
    expect(game.currentEnding.value?.statusItems?.[1]?.value).toBe('已满足')
    expect(game.currentEnding.value?.statusItems?.[2]?.value).toBe('2 条')
  })

  it('falls back to normal victory if the player knows the truth but missed the heart seed', () => {
    const game = useGameEngine({ bgmController: createFakeBgmController() })

    game.startGame()
    game.chooseOption('scene1-offer-memory')
    game.chooseOption('scene2-listen-wind')
    game.chooseOption('scene3-ask-reflection')
    game.chooseOption('scene4-follow-lights')
    game.chooseOption('scene5-rush-bridge')
    game.chooseOption('scene6-renew-pact')

    expect(game.state.ending).toBe('victory')
  })

  it('fully resets story progress and bgm state on restart', () => {
    const game = useGameEngine({ bgmController: createFakeBgmController() })

    game.startGame()
    game.chooseOption('scene1-offer-memory')
    game.chooseOption('scene2-listen-wind')
    game.restart()

    expect(game.state.hasStarted).toBe(false)
    expect(game.state.memory).toBe(10)
    expect(game.state.truthClueCount).toBe(0)
    expect(game.state.savedWhiteDeer).toBe(false)
    expect(game.state.hasHeartSeed).toBe(false)
    expect(game.state.ending).toBeNull()
    expect(game.state.bgmState).toBe('idle')
    expect(game.state.history).toHaveLength(0)
  })

  it('returns to a clean intro state on exit', () => {
    const game = useGameEngine({ bgmController: createFakeBgmController() })

    game.startGame()
    game.chooseOption('scene1-offer-memory')
    game.chooseOption('scene2-listen-wind')
    game.exitGame()

    expect(game.state.hasStarted).toBe(false)
    expect(game.state.currentSceneId).toBe('scene1')
    expect(game.state.memory).toBe(10)
    expect(game.state.truthClueCount).toBe(0)
    expect(game.state.trustForest).toBe(false)
    expect(game.state.ending).toBeNull()
    expect(game.state.transitionText).toBeNull()
    expect(game.state.bgmState).toBe('idle')
  })

  it('explains memory collapse when the player runs out of memory before the finale', () => {
    const game = useGameEngine({ bgmController: createFakeBgmController() })

    game.startGame()
    game.chooseOption('scene1-offer-memory')
    game.chooseOption('scene2-chase-voice')
    game.chooseOption('scene3-break-mirror')
    game.chooseOption('scene4-shortcut')
    game.chooseOption('scene5-rush-bridge')

    expect(game.state.ending).toBe('fail')
    expect(game.currentEnding.value?.reasonSummary?.[0]).toContain('耗尽了记忆值')
    expect(game.currentEnding.value?.statusItems?.[0]?.value).toBe('0/10')
  })
})
