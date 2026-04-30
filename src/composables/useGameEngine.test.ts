import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import {
  DEFAULT_CHAPTER_ID,
  getChapter,
  getHomeContent,
  getPrologueContent,
  getSceneImage
} from '../data/story'
import { useGameEngine } from './useGameEngine'
import type { BgmControllerLike, BgmState, SceneId } from '../types/game'

function createFakeBgmController(): BgmControllerLike {
  const audioMuted = ref(false)
  const bgmState = ref<BgmState>('idle')

  return {
    audioMuted,
    bgmState,
    playCue(cue) {
      bgmState.value = cue
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

function createGame() {
  return useGameEngine({ bgmController: createFakeBgmController() })
}

describe('useGameEngine', () => {
  it('starts on the home view without auto-playing music', () => {
    const game = createGame()

    expect(game.state.view).toBe('home')
    expect(game.state.bgmState).toBe('idle')
  })

  it('enters the prologue and starts the home cue after the first home click', () => {
    const game = createGame()

    game.enterPrologue()

    expect(game.state.view).toBe('prologue')
    expect(game.state.bgmState).toBe('home')
    expect(game.prologueContent.value.title).toContain('旧约')
  })

  it('enters the playable story at scene1 and switches to the prologue cue', () => {
    const game = createGame()

    game.enterPrologue()
    game.startAdventure()

    expect(game.state.view).toBe('playing')
    expect(game.state.currentChapterId).toBe(DEFAULT_CHAPTER_ID)
    expect(game.state.currentSceneId).toBe('scene1')
    expect(game.state.bgmState).toBe('prologue')
    expect(game.currentScene.value.title).toBe('姐姐的房间')
  })

  it('loads the 15-scene chapter order and all mapped images', () => {
    const chapter = getChapter(DEFAULT_CHAPTER_ID)
    const sceneIds = chapter.sceneOrder as SceneId[]

    expect(sceneIds).toEqual([
      'scene1',
      'scene2',
      'scene3',
      'scene4',
      'scene5',
      'scene13',
      'scene6',
      'scene7',
      'scene8',
      'scene9',
      'scene14',
      'scene10',
      'scene15',
      'scene11',
      'scene12'
    ])
    expect(getHomeContent(DEFAULT_CHAPTER_ID).image).toBeTruthy()
    expect(getPrologueContent(DEFAULT_CHAPTER_ID).image).toBeTruthy()

    for (const sceneId of sceneIds) {
      const scene = chapter.scenes[sceneId]
      expect(scene.choices).toHaveLength(2)
      expect(scene.musicCue).toBeTruthy()
      expect(getSceneImage(DEFAULT_CHAPTER_ID, sceneId)).toBeTruthy()
      for (const choice of scene.choices) {
        expect(choice.toneLabel).toBeTruthy()
        expect(choice.effectHint).toBeTruthy()
        expect(choice.effect.transitionKey).toBeTruthy()
      }
    }
  })

  it('reaches the hidden ending on the full truth-and-trust route across 15 scenes', () => {
    const game = createGame()

    game.enterPrologue()
    game.startAdventure()
    game.chooseOption('scene1-inspect-keepsakes')
    game.chooseOption('scene2-offer-memory')
    game.chooseOption('scene3-read-trail')
    game.chooseOption('scene4-read-letter')
    game.chooseOption('scene5-listen-bells')
    game.chooseOption('scene13-read-notes')
    game.chooseOption('scene6-ask-reflection')
    game.chooseOption('scene7-remember-vow')
    game.chooseOption('scene8-follow-lights')
    game.chooseOption('scene9-save-deer')
    game.chooseOption('scene14-follow-bells')
    game.chooseOption('scene10-listen-confession')
    game.chooseOption('scene15-follow-lamps')
    game.chooseOption('scene11-hear-sister')
    game.chooseOption('scene12-renew-pact')

    expect(game.state.trustForest).toBe(true)
    expect(game.state.truthClueCount).toBeGreaterThanOrEqual(8)
    expect(game.state.savedWhiteDeer).toBe(true)
    expect(game.state.hasHeartSeed).toBe(true)
    expect(game.state.ending).toBe('hidden')
    expect(game.state.endingReason).toBe('forest_blessing')
    expect(game.state.bgmState).toBe('hidden')
    expect(game.currentEnding.value?.statusItems?.[2]?.value).toContain('条')
  })

  it('reaches normal victory when the player cuts the roots', () => {
    const game = createGame()

    game.enterPrologue()
    game.startAdventure()
    game.chooseOption('scene1-chase-sister')
    game.chooseOption('scene2-force-entry')
    game.chooseOption('scene3-read-trail')
    game.chooseOption('scene4-read-letter')
    game.chooseOption('scene5-listen-bells')
    game.chooseOption('scene13-read-notes')
    game.chooseOption('scene6-break-illusion')
    game.chooseOption('scene7-remember-vow')
    game.chooseOption('scene8-follow-lights')
    game.chooseOption('scene9-rush-bridge')
    game.chooseOption('scene14-cross-court')
    game.chooseOption('scene10-call-and-run')
    game.chooseOption('scene15-chase-voice')
    game.chooseOption('scene11-interrupt-leave')
    game.chooseOption('scene12-cut-roots')

    expect(game.state.ending).toBe('victory')
    expect(game.state.endingReason).toBe('forced_rescue')
    expect(game.state.bgmState).toBe('victory')
  })

  it('falls back to normal pact victory when the hidden conditions are incomplete', () => {
    const game = createGame()

    game.enterPrologue()
    game.startAdventure()
    game.chooseOption('scene1-inspect-keepsakes')
    game.chooseOption('scene2-force-entry')
    game.chooseOption('scene3-read-trail')
    game.chooseOption('scene4-read-letter')
    game.chooseOption('scene5-listen-bells')
    game.chooseOption('scene13-read-notes')
    game.chooseOption('scene6-ask-reflection')
    game.chooseOption('scene7-remember-vow')
    game.chooseOption('scene8-follow-lights')
    game.chooseOption('scene9-rush-bridge')
    game.chooseOption('scene14-follow-bells')
    game.chooseOption('scene10-listen-confession')
    game.chooseOption('scene15-follow-lamps')
    game.chooseOption('scene11-hear-sister')
    game.chooseOption('scene12-renew-pact')

    expect(game.state.ending).toBe('victory')
    expect(game.state.endingReason).toBe('pact_incomplete')
    expect(game.state.bgmState).toBe('victory')
  })

  it('fails when the player reaches the pact ending without enough truth or trust', () => {
    const game = createGame()

    game.enterPrologue()
    game.startAdventure()
    game.chooseOption('scene1-chase-sister')
    game.chooseOption('scene2-force-entry')
    game.chooseOption('scene3-read-trail')
    game.chooseOption('scene4-take-map')
    game.chooseOption('scene5-rush-cries')
    game.chooseOption('scene13-search-supplies')
    game.chooseOption('scene6-break-illusion')
    game.chooseOption('scene7-force-through')
    game.chooseOption('scene8-follow-lights')
    game.chooseOption('scene9-rush-bridge')
    game.chooseOption('scene14-cross-court')
    game.chooseOption('scene10-listen-confession')
    game.chooseOption('scene15-follow-lamps')
    game.chooseOption('scene11-hear-sister')
    game.chooseOption('scene12-renew-pact')

    expect(game.state.ending).toBe('fail')
    expect(game.state.endingReason).toBe('pact_rejected')
    expect(game.state.bgmState).toBe('fail')
  })

  it('fails immediately when memory reaches zero on the swamp shortcut route', () => {
    const game = createGame()

    game.enterPrologue()
    game.startAdventure()
    game.chooseOption('scene1-chase-sister')
    game.chooseOption('scene2-offer-memory')
    game.chooseOption('scene3-chase-cry')
    game.chooseOption('scene4-take-map')
    game.chooseOption('scene5-rush-cries')
    game.chooseOption('scene13-search-supplies')
    game.chooseOption('scene6-break-illusion')
    game.chooseOption('scene7-force-through')
    game.chooseOption('scene8-cut-shortcut')

    expect(game.state.ending).toBe('fail')
    expect(game.state.endingReason).toBe('memory_depleted')
    expect(game.state.memory).toBe(0)
    expect(game.state.bgmState).toBe('fail')
  })

  it('caps memory recovery from the vow scene at the maximum of 10', () => {
    const game = createGame()

    game.enterPrologue()
    game.startAdventure()
    game.chooseOption('scene1-inspect-keepsakes')
    game.chooseOption('scene2-force-entry')
    game.chooseOption('scene3-read-trail')
    game.chooseOption('scene4-read-letter')
    game.chooseOption('scene5-listen-bells')
    game.chooseOption('scene13-read-notes')
    game.chooseOption('scene6-ask-reflection')

    expect(game.state.memory).toBe(10)

    game.state.currentSceneId = 'scene7'
    game.state.memory = 10
    game.chooseOption('scene7-remember-vow')

    expect(game.state.memory).toBe(10)
  })

  it('uses the reduced swamp loss when trust or enough clues are present', () => {
    const trustingGame = createGame()

    trustingGame.enterPrologue()
    trustingGame.startAdventure()
    trustingGame.chooseOption('scene1-inspect-keepsakes')
    trustingGame.chooseOption('scene2-offer-memory')
    trustingGame.chooseOption('scene3-read-trail')
    trustingGame.chooseOption('scene4-read-letter')
    trustingGame.chooseOption('scene5-listen-bells')
    trustingGame.chooseOption('scene13-read-notes')
    trustingGame.chooseOption('scene6-break-illusion')
    trustingGame.chooseOption('scene7-force-through')

    const beforeTrustedSwamp = trustingGame.state.memory

    trustingGame.chooseOption('scene8-follow-lights')

    expect(trustingGame.state.memory).toBe(beforeTrustedSwamp - 1)

    const doubtfulGame = createGame()

    doubtfulGame.enterPrologue()
    doubtfulGame.startAdventure()
    doubtfulGame.chooseOption('scene1-chase-sister')
    doubtfulGame.chooseOption('scene2-force-entry')
    doubtfulGame.chooseOption('scene3-chase-cry')
    doubtfulGame.chooseOption('scene4-take-map')
    doubtfulGame.chooseOption('scene5-rush-cries')
    doubtfulGame.chooseOption('scene13-search-supplies')
    doubtfulGame.chooseOption('scene6-break-illusion')
    doubtfulGame.chooseOption('scene7-force-through')

    const beforeDoubtfulSwamp = doubtfulGame.state.memory

    doubtfulGame.chooseOption('scene8-follow-lights')

    expect(doubtfulGame.state.memory).toBe(beforeDoubtfulSwamp - 2)
  })

  it('applies the new scene13 and scene14 clue path effects', () => {
    const game = createGame()

    game.enterPrologue()
    game.startAdventure()
    game.chooseOption('scene1-inspect-keepsakes')
    game.chooseOption('scene2-force-entry')
    game.chooseOption('scene3-read-trail')
    game.chooseOption('scene4-read-letter')
    game.chooseOption('scene5-listen-bells')

    const clueBefore13 = game.state.truthClueCount

    game.chooseOption('scene13-read-notes')

    expect(game.state.truthClueCount).toBe(clueBefore13 + 1)

    game.state.currentSceneId = 'scene14'
    const clueBefore14 = game.state.truthClueCount
    game.chooseOption('scene14-follow-bells')

    expect(game.state.truthClueCount).toBe(clueBefore14 + 1)
  })

  it('resets to the prologue with home music on restart', () => {
    const game = createGame()

    game.enterPrologue()
    game.startAdventure()
    game.chooseOption('scene1-inspect-keepsakes')
    game.chooseOption('scene2-offer-memory')
    game.chooseOption('scene3-read-trail')
    game.restart()

    expect(game.state.view).toBe('prologue')
    expect(game.state.currentSceneId).toBe('scene1')
    expect(game.state.memory).toBe(10)
    expect(game.state.truthClueCount).toBe(0)
    expect(game.state.savedWhiteDeer).toBe(false)
    expect(game.state.hasHeartSeed).toBe(false)
    expect(game.state.ending).toBeNull()
    expect(game.state.bgmState).toBe('home')
  })

  it('returns to a clean home state on exit', () => {
    const game = createGame()

    game.enterPrologue()
    game.startAdventure()
    game.chooseOption('scene1-inspect-keepsakes')
    game.chooseOption('scene2-offer-memory')
    game.exitGame()

    expect(game.state.view).toBe('home')
    expect(game.state.currentSceneId).toBe('scene1')
    expect(game.state.memory).toBe(10)
    expect(game.state.truthClueCount).toBe(0)
    expect(game.state.trustForest).toBe(false)
    expect(game.state.savedWhiteDeer).toBe(false)
    expect(game.state.hasHeartSeed).toBe(false)
    expect(game.state.ending).toBeNull()
    expect(game.state.bgmState).toBe('home')
  })
})
