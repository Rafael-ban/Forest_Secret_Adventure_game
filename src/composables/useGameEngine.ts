import { computed, reactive, watch } from 'vue'
import {
  DEFAULT_CHAPTER_ID,
  getChapter,
  getEndingContent,
  getHomeContent,
  getPrologueContent,
  getSceneImage,
  storyData
} from '../data/story'
import { useBgmController } from './useBgmController'
import type {
  BgmControllerLike,
  ChapterId,
  ChoiceRuleId,
  EndingContent,
  EndingId,
  EndingReasonId,
  EndingStatusItem,
  GameState,
  PageContent,
  SceneContent,
  SceneId,
  ViewId
} from '../types/game'

const MAX_MEMORY = 10

function createInitialState(audioMuted = false, view: ViewId = 'home'): GameState {
  const chapter = getChapter(DEFAULT_CHAPTER_ID)

  return {
    view,
    memory: MAX_MEMORY,
    maxMemory: MAX_MEMORY,
    currentChapterId: DEFAULT_CHAPTER_ID,
    currentSceneId: chapter.startSceneId,
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

  const currentChapter = computed(() => getChapter(state.currentChapterId))
  const homeContent = computed(() => getHomeContent(state.currentChapterId))
  const prologueContent = computed(() => getPrologueContent(state.currentChapterId))

  function resetForView(view: ViewId) {
    Object.assign(state, createInitialState(bgmController.audioMuted.value, view))
    historyId = 0
  }

  function pushHistory(text: string) {
    const sceneId =
      state.view === 'home'
        ? 'home'
        : state.view === 'prologue'
          ? 'prologue'
          : state.currentSceneId

    state.history.push({
      id: ++historyId,
      chapterId: state.currentChapterId,
      sceneId,
      text
    })
  }

  function setTransition(text: string | null) {
    state.transitionText = text

    if (text) {
      pushHistory(text)
    }
  }

  function clampMemory(value: number) {
    return Math.max(0, Math.min(MAX_MEMORY, value))
  }

  function hasHiddenEndingRoute() {
    return (
      state.trustForest &&
      state.truthClueCount >= 8 &&
      state.savedWhiteDeer &&
      state.hasHeartSeed &&
      state.memory > 0
    )
  }

  function hasPactVictoryRoute() {
    return state.truthClueCount >= 6 && state.memory > 1
  }

  function resolveChoiceRule(rule: ChoiceRuleId) {
    switch (rule) {
      case 'swamp_follow_lights':
        return {
          memoryDelta: state.trustForest || state.truthClueCount >= 4 ? -1 : -2
        }
      case 'final_pact_resolution':
        if (hasHiddenEndingRoute()) {
          return {
            endingId: 'hidden' as EndingId,
            endingReason: 'forest_blessing' as EndingReasonId
          }
        }

        if (hasPactVictoryRoute()) {
          return {
            endingId: 'victory' as EndingId,
            endingReason: 'pact_incomplete' as EndingReasonId
          }
        }

        return {
          endingId: 'fail' as EndingId,
          endingReason: 'pact_rejected' as EndingReasonId
        }
    }
  }

  function syncSceneCue(sceneId: SceneId = state.currentSceneId) {
    bgmController.playCue(currentChapter.value.scenes[sceneId].musicCue)
  }

  function triggerEnding(endingId: EndingId, endingReason: EndingReasonId) {
    state.ending = endingId
    state.endingReason = endingReason
    const ending = currentChapter.value.endings[endingId]
    bgmController.playCue(ending.musicCue)
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
    syncSceneCue(sceneId)
  }

  function enterPrologue() {
    if (state.view !== 'home') {
      return
    }

    state.view = 'prologue'
    state.currentSceneId = currentChapter.value.startSceneId
    setTransition(currentChapter.value.transitions.enterPrologue)
    bgmController.playCue(homeContent.value.musicCue)
  }

  function startAdventure() {
    if (state.view !== 'prologue') {
      return
    }

    state.view = 'playing'
    state.currentSceneId = currentChapter.value.startSceneId
    setTransition(currentChapter.value.transitions.startAdventure)
    syncSceneCue(currentChapter.value.startSceneId)
  }

  function chooseConfiguredOption(choiceId: string) {
    const scene = currentChapter.value.scenes[state.currentSceneId]
    const choice = scene.choices.find((item) => item.id === choiceId)

    if (!choice) {
      return
    }

    const resolvedRule = choice.effect.rule ? resolveChoiceRule(choice.effect.rule) : null
    const memoryDelta = resolvedRule?.memoryDelta ?? choice.effect.memoryDelta ?? 0

    if (memoryDelta !== 0 && !applyMemoryDelta(memoryDelta)) {
      return
    }

    state.truthClueCount += choice.effect.truthClueDelta ?? 0

    if (choice.effect.setTrustForest) {
      state.trustForest = true
    }

    if (choice.effect.setSavedWhiteDeer) {
      state.savedWhiteDeer = true
    }

    if (choice.effect.setHasHeartSeed) {
      state.hasHeartSeed = true
    }

    const transitionText = currentChapter.value.transitions[choice.effect.transitionKey] ?? null
    setTransition(transitionText)

    const endingId = resolvedRule?.endingId ?? choice.effect.endingId
    const endingReason = resolvedRule?.endingReason ?? choice.effect.endingReason

    if (endingId && endingReason) {
      triggerEnding(endingId, endingReason)
      return
    }

    if (choice.effect.nextSceneId) {
      goToScene(choice.effect.nextSceneId)
    }
  }

  function chooseOption(choiceId: string) {
    if (state.view !== 'playing' || state.ending) {
      return
    }

    chooseConfiguredOption(choiceId)
  }

  function restart() {
    resetForView('prologue')
    setTransition(currentChapter.value.transitions.enterPrologue)
    bgmController.playCue(homeContent.value.musicCue)
  }

  function exitGame() {
    resetForView('home')
    bgmController.playCue(homeContent.value.musicCue)
  }

  function toggleAudio() {
    bgmController.toggleMuted()
  }

  const currentScene = computed<SceneContent>(() => {
    const scene = currentChapter.value.scenes[state.currentSceneId]

    return {
      id: state.currentSceneId,
      title: scene.title,
      body: [...scene.body],
      prompt: scene.prompt,
      image: getSceneImage(state.currentChapterId, state.currentSceneId),
      musicCue: scene.musicCue,
      choices: scene.choices
    }
  })

  const currentPage = computed<PageContent>(() =>
    state.view === 'home' ? homeContent.value : prologueContent.value
  )

  function buildEndingReasonSummary(endingReason: EndingReasonId) {
    switch (endingReason) {
      case 'memory_depleted':
        return [
          '你在抵达终点前先丢失了最关键的记忆，森林不再承认你的来意。',
          '你知道自己是在追姐姐，却已经说不清为什么一定要把她带回来。'
        ]
      case 'forced_rescue':
        return [
          '你选择先把姐姐带离心树，把今夜的危险切断在眼前。',
          '可旧约没有被修复，森林只是把这笔债推迟到了下一次。'
        ]
      case 'pact_incomplete':
        return [
          '你理解了大部分真相，也愿意请求心树停手，但还不足以让旧约完整闭合。',
          '姐姐得救了，森林也短暂安静了下来，只是伤口没有真正长好。'
        ]
      case 'pact_rejected':
        return [
          '你尝试修复旧约，却没有带着足够完整的真相和准备来到心树前。',
          '心树没有接受这次归还，迷雾也因此没有停止。'
        ]
      case 'forest_blessing':
        return [
          '你带着足够的真相、信任和心种来到终点，终于说出了森林愿意听见的话。',
          '姐姐活了下来，心树也重新认回了村庄欠下并愿意偿还的名字。'
        ]
    }
  }

  function buildEndingStatusItems(): EndingStatusItem[] {
    const memoryTone =
      state.memory <= 0 ? 'danger' : state.memory <= 2 ? 'warning' : 'success'
    const truthTone =
      state.truthClueCount >= 8
        ? 'success'
        : state.truthClueCount >= 6
          ? 'warning'
          : 'danger'

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
        tone: truthTone
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

    const ending = getEndingContent(state.currentChapterId, state.ending)

    return {
      ...ending,
      body: [...ending.body],
      reasonSummary: buildEndingReasonSummary(state.endingReason),
      statusItems: buildEndingStatusItems()
    }
  })

  const locationName = computed(() => {
    if (state.view === 'home' || state.view === 'prologue') {
      return currentPage.value.title
    }

    return currentScene.value.title
  })

  const sceneIndex = computed(() => {
    const index = currentChapter.value.sceneOrder.indexOf(state.currentSceneId)
    return index >= 0 ? index + 1 : 1
  })

  const sceneCount = computed(() => currentChapter.value.sceneOrder.length)

  return {
    state,
    homeContent,
    prologueContent,
    currentPage,
    currentScene,
    currentEnding,
    activeChoices: computed(() => currentScene.value.choices),
    locationName,
    sceneIndex,
    sceneCount,
    uiText: storyData.ui,
    enterPrologue,
    startAdventure,
    chooseOption,
    restart,
    exitGame,
    toggleAudio
  }
}
