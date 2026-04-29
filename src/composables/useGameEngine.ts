import { computed, reactive, watch } from 'vue'
import { endings, getSceneImage, introContent, storyData } from '../data/story'
import { useBgmController } from './useBgmController'
import type {
  BgmControllerLike,
  EndingContent,
  EndingId,
  EndingReasonId,
  EndingStatusItem,
  GameState,
  SceneContent,
  SceneId
} from '../types/game'

const MAX_MEMORY = 10

function createInitialState(audioMuted = false): GameState {
  return {
    hasStarted: false,
    memory: MAX_MEMORY,
    maxMemory: MAX_MEMORY,
    currentSceneId: 'scene1',
    trustForest: false,
    truthClueCount: 0,
    savedWhiteDeer: false,
    hasHeartSeed: false,
    ending: null,
    endingReason: null,
    audioMuted,
    bgmState: 'idle',
    transitionText: null,
    history: []
  }
}

interface UseGameEngineOptions {
  bgmController?: BgmControllerLike
}

export function useGameEngine(options: UseGameEngineOptions = {}) {
  const bgmController = options.bgmController ?? useBgmController()
  const state = reactive<GameState>(createInitialState(bgmController.audioMuted.value))
  let historyId = 0

  watch(
    () => bgmController.audioMuted.value,
    (value) => {
      state.audioMuted = value
    },
    { immediate: true, flush: 'sync' }
  )

  watch(
    () => bgmController.bgmState.value,
    (value) => {
      state.bgmState = value
    },
    { immediate: true, flush: 'sync' }
  )

  function resetState() {
    Object.assign(state, createInitialState(bgmController.audioMuted.value))
    historyId = 0
    bgmController.resetToIdle()
  }

  function pushHistory(text: string) {
    state.history.push({
      id: ++historyId,
      sceneId: state.hasStarted ? state.currentSceneId : 'intro',
      text
    })
  }

  function setTransition(text: string) {
    state.transitionText = text
    pushHistory(text)
  }

  function clampMemory(value: number) {
    return Math.max(0, Math.min(MAX_MEMORY, value))
  }

  function triggerEnding(endingId: EndingId, endingReason: EndingReasonId) {
    state.ending = endingId
    state.endingReason = endingReason
    bgmController.playEnding(endingId === 'fail' ? 'fail' : 'victory')
  }

  function applyMemoryDelta(delta: number) {
    state.memory = clampMemory(state.memory + delta)

    if (state.memory <= 0) {
      triggerEnding('fail', 'memory_depleted')
      return false
    }

    return true
  }

  function goToScene(sceneId: SceneId) {
    state.currentSceneId = sceneId
  }

  function hasHiddenEndingRoute() {
    return (
      state.trustForest &&
      state.truthClueCount >= 2 &&
      state.savedWhiteDeer &&
      state.hasHeartSeed &&
      state.memory > 0
    )
  }

  function startGame() {
    if (state.hasStarted) {
      return
    }

    state.hasStarted = true
    state.currentSceneId = 'scene1'
    setTransition(storyData.transitions.startGame)
    bgmController.startAdventure()
  }

  function chooseOption(choiceId: string) {
    if (!state.hasStarted || state.ending) {
      return
    }

    switch (choiceId) {
      case 'scene1-offer-memory':
        if (!applyMemoryDelta(-1)) return
        state.trustForest = true
        setTransition(storyData.transitions.scene1OfferMemory)
        goToScene('scene2')
        return
      case 'scene1-force-entry':
        setTransition(storyData.transitions.scene1ForceEntry)
        goToScene('scene2')
        return
      case 'scene2-listen-wind':
        state.truthClueCount += 1
        setTransition(storyData.transitions.scene2ListenWind)
        goToScene('scene3')
        return
      case 'scene2-chase-voice':
        if (!applyMemoryDelta(-2)) return
        setTransition(storyData.transitions.scene2ChaseVoice)
        goToScene('scene3')
        return
      case 'scene3-ask-reflection':
        if (!applyMemoryDelta(-1)) return
        state.truthClueCount += 1
        setTransition(storyData.transitions.scene3AskReflection)
        goToScene('scene4')
        return
      case 'scene3-break-mirror':
        if (!applyMemoryDelta(-1)) return
        setTransition(storyData.transitions.scene3BreakMirror)
        goToScene('scene4')
        return
      case 'scene4-follow-lights': {
        const loss = state.truthClueCount > 0 || state.trustForest ? -1 : -2
        if (!applyMemoryDelta(loss)) return
        setTransition(storyData.transitions.scene4FollowLights)
        goToScene('scene5')
        return
      }
      case 'scene4-shortcut':
        if (!applyMemoryDelta(-4)) return
        setTransition(storyData.transitions.scene4Shortcut)
        goToScene('scene5')
        return
      case 'scene5-save-deer':
        if (!applyMemoryDelta(-1)) return
        state.savedWhiteDeer = true
        state.hasHeartSeed = true
        setTransition(storyData.transitions.scene5SaveDeer)
        goToScene('scene6')
        return
      case 'scene5-rush-bridge':
        if (!applyMemoryDelta(-2)) return
        setTransition(storyData.transitions.scene5RushBridge)
        goToScene('scene6')
        return
      case 'scene6-cut-roots':
        setTransition(storyData.transitions.scene6CutRoots)
        triggerEnding('victory', 'forced_rescue')
        return
      case 'scene6-renew-pact':
        if (hasHiddenEndingRoute()) {
          setTransition(storyData.transitions.scene6RenewPactHidden)
          triggerEnding('hidden', 'forest_blessing')
          return
        }

        if (state.truthClueCount >= 2 && state.memory > 1) {
          setTransition(storyData.transitions.scene6RenewPactFallback)
          triggerEnding('victory', 'pact_incomplete')
          return
        }

        setTransition(storyData.transitions.scene6RenewPactFail)
        triggerEnding('fail', 'pact_rejected')
        return
      default:
        return
    }
  }

  function restart() {
    resetState()
  }

  function exitGame() {
    resetState()
  }

  function toggleAudio() {
    bgmController.toggleMuted()
  }

  const currentScene = computed<SceneContent>(() => {
    const scene = storyData.scenes[state.currentSceneId]

    return {
      id: state.currentSceneId,
      title: scene.title,
      body: [...scene.body],
      prompt: scene.prompt,
      image: getSceneImage(state.currentSceneId),
      choices: scene.choices
    }
  })

  function buildEndingReasonSummary(endingReason: EndingReasonId) {
    switch (endingReason) {
      case 'memory_depleted':
        return [
          '你在抵达终点前耗尽了记忆值，迷雾先一步带走了你用来辨认真相的力量。',
          '这场失败不是因为你没有继续前进，而是你已经无法保住自己为何而来。'
        ]
      case 'forced_rescue':
        return [
          '你选择直接砍断树根，把姐姐从心树前强行带离，所以保住了人，却没有真正修复旧约。',
          '这是一场救人的胜利，也是把代价继续留给森林的胜利。'
        ]
      case 'pact_incomplete':
        return [
          '你试图修复旧约，也拼回了一部分真相，但森林没有把全部条件交到你手里。',
          '你因此救回了姐姐，却没能让心树真正接受新的约定。'
        ]
      case 'pact_rejected':
        return [
          '你走到了心树面前，却没有同时带着足够的信任、线索与代价去完成旧约。',
          '迷雾没有接受你的请求，反而把你一路拼起的理解重新打散了。'
        ]
      case 'forest_blessing':
        return [
          '你赢得了森林的初步信任，拼回了真相，也救下白鹿拿到了心种。',
          '当你归还心种并承认旧约，心树终于接受了这次修复，而不是继续索债。'
        ]
    }
  }

  function buildEndingStatusItems(): EndingStatusItem[] {
    const memoryTone =
      state.memory <= 0 ? 'danger' : state.memory <= 2 ? 'warning' : 'success'

    return [
      {
        label: storyData.ui.endingMemoryLabel,
        value: `${state.memory}/${state.maxMemory}`,
        tone: memoryTone
      },
      {
        label: storyData.ui.trustStatusLabel,
        value: state.trustForest ? storyData.ui.metLabel : storyData.ui.missedLabel,
        tone: state.trustForest ? 'success' : 'warning'
      },
      {
        label: storyData.ui.truthStatusLabel,
        value: `${state.truthClueCount} 条`,
        tone: state.truthClueCount >= 2 ? 'success' : 'warning'
      },
      {
        label: storyData.ui.whiteDeerStatusLabel,
        value: state.savedWhiteDeer ? storyData.ui.metLabel : storyData.ui.missedLabel,
        tone: state.savedWhiteDeer ? 'success' : 'warning'
      },
      {
        label: storyData.ui.heartSeedStatusLabel,
        value: state.hasHeartSeed ? storyData.ui.metLabel : storyData.ui.missedLabel,
        tone: state.hasHeartSeed ? 'success' : 'warning'
      }
    ]
  }

  const currentEnding = computed<EndingContent | null>(() => {
    if (!state.ending || !state.endingReason) {
      return null
    }

    const ending = endings[state.ending]

    return {
      ...ending,
      body: [...ending.body],
      reasonSummary: buildEndingReasonSummary(state.endingReason),
      statusItems: buildEndingStatusItems()
    }
  })

  const locationName = computed(() =>
    state.hasStarted ? currentScene.value.title.replace(/^场景\d+：/, '') : introContent.title
  )

  return {
    state,
    introContent,
    currentScene,
    currentEnding,
    activeChoices: computed(() => currentScene.value.choices),
    locationName,
    uiText: storyData.ui,
    startGame,
    chooseOption,
    restart,
    exitGame,
    toggleAudio
  }
}
