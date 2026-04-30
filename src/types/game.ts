export type ChapterId = 'chapter1'

export type ViewId = 'home' | 'prologue' | 'playing'

export type SceneId =
  | 'scene1'
  | 'scene2'
  | 'scene3'
  | 'scene4'
  | 'scene5'
  | 'scene6'
  | 'scene7'
  | 'scene8'
  | 'scene9'
  | 'scene10'
  | 'scene11'
  | 'scene12'
  | 'scene13'
  | 'scene14'
  | 'scene15'

export type EndingId = 'victory' | 'fail' | 'hidden'

export type BgmCue =
  | 'home'
  | 'prologue'
  | 'departure'
  | 'investigation'
  | 'revelation'
  | 'danger'
  | 'finale'
  | 'victory'
  | 'hidden'
  | 'fail'

export type BgmState = 'idle' | BgmCue

export type EndingReasonId =
  | 'memory_depleted'
  | 'forced_rescue'
  | 'pact_incomplete'
  | 'pact_rejected'
  | 'forest_blessing'

export type ChoiceRuleId = 'swamp_follow_lights' | 'final_pact_resolution'

export type ImageKey =
  | 'home'
  | 'prologue'
  | 'scene1'
  | 'scene2'
  | 'scene3'
  | 'scene4'
  | 'scene5'
  | 'scene6'
  | 'scene7'
  | 'scene8'
  | 'scene9'
  | 'scene10'
  | 'scene11'
  | 'scene12'
  | 'scene13'
  | 'scene14'
  | 'scene15'
  | 'fail'
  | 'victory'
  | 'hidden'

export interface StoryChoiceEffect {
  transitionKey: string
  nextSceneId?: SceneId
  memoryDelta?: number
  truthClueDelta?: number
  setTrustForest?: boolean
  setSavedWhiteDeer?: boolean
  setHasHeartSeed?: boolean
  endingId?: EndingId
  endingReason?: EndingReasonId
  rule?: ChoiceRuleId
}

export interface StoryChoice {
  id: string
  label: string
  toneLabel?: string
  effectHint?: string
  effect: StoryChoiceEffect
}

export interface StoryPageTemplate {
  kicker: string
  title: string
  body: string[]
  buttonLabel: string
  imageKey: ImageKey
  musicCue: BgmCue
}

export interface SceneTemplate {
  title: string
  body: string[]
  prompt: string
  imageKey: ImageKey
  musicCue: BgmCue
  choices: StoryChoice[]
}

export interface EndingTemplate {
  title: string
  body: string[]
  imageKey: ImageKey
  musicCue: BgmCue
}

export interface EndingStatusItem {
  label: string
  value: string
  tone?: 'neutral' | 'success' | 'warning' | 'danger'
}

export interface StoryChapterTemplate {
  label: string
  startSceneId: SceneId
  sceneOrder: SceneId[]
  home: StoryPageTemplate
  prologue: StoryPageTemplate
  scenes: Record<SceneId, SceneTemplate>
  transitions: Record<string, string>
  endings: Record<EndingId, EndingTemplate>
}

export interface StoryTextData {
  chapters: Record<ChapterId, StoryChapterTemplate>
  ui: {
    brand: string
    memoryLabel: string
    progressLabel: string
    stageLabel: string
    clueLabel: string
    resultLabel: string
    restartLabel: string
    exitLabel: string
    audioLabel: string
    muteLabel: string
    unmuteLabel: string
    endingReasonLabel: string
    endingStatusLabel: string
    endingMemoryLabel: string
    trustStatusLabel: string
    truthStatusLabel: string
    whiteDeerStatusLabel: string
    heartSeedStatusLabel: string
    metLabel: string
    missedLabel: string
    homeTagLabel: string
    prologueTagLabel: string
    beginJourneyLabel: string
    returnHomeLabel: string
  }
}

export interface SceneContent {
  id: SceneId
  title: string
  body: string[]
  prompt: string
  image: string
  musicCue: BgmCue
  choices: StoryChoice[]
}

export interface PageContent {
  kicker: string
  title: string
  body: string[]
  buttonLabel: string
  image: string
  musicCue: BgmCue
}

export interface EndingContent {
  id: EndingId
  title: string
  body: string[]
  image: string
  musicCue: BgmCue
  reasonSummary?: string[]
  statusItems?: EndingStatusItem[]
}

export interface HistoryEntry {
  id: number
  chapterId: ChapterId
  sceneId: SceneId | 'home' | 'prologue'
  text: string
}

export interface GameState {
  view: ViewId
  memory: number
  maxMemory: number
  currentChapterId: ChapterId
  currentSceneId: SceneId
  trustForest: boolean
  truthClueCount: number
  savedWhiteDeer: boolean
  hasHeartSeed: boolean
  ending: EndingId | null
  endingReason: EndingReasonId | null
  audioMuted: boolean
  bgmState: BgmState
  transitionText: string | null
  history: HistoryEntry[]
}

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export interface AudioLike {
  loop: boolean
  volume: number
  muted: boolean
  currentTime: number
  play(): Promise<void> | void
  pause(): void
}

export interface BgmControllerLike {
  audioMuted: { value: boolean }
  bgmState: { value: BgmState }
  playCue(cue: BgmCue): void
  resetToIdle(): void
  stopAll(): void
  toggleMuted(): void
}
