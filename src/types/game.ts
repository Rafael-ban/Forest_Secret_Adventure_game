export type SceneId =
  | 'scene1'
  | 'scene2'
  | 'scene3'
  | 'scene4'
  | 'scene5'
  | 'scene6'

export type EndingId = 'victory' | 'fail' | 'hidden'
export type BgmState = 'idle' | 'start' | 'victory' | 'fail'
export type EndingReasonId =
  | 'memory_depleted'
  | 'forced_rescue'
  | 'pact_incomplete'
  | 'pact_rejected'
  | 'forest_blessing'

export type ImageKey =
  | 'intro'
  | 'scene1'
  | 'scene2'
  | 'scene3'
  | 'scene4'
  | 'scene5'
  | 'scene6'
  | 'fail'
  | 'victory'
  | 'hidden'

export interface StoryChoice {
  id: string
  label: string
}

export interface IntroTemplate {
  kicker: string
  title: string
  body: string[]
  buttonLabel: string
  imageKey: ImageKey
}

export interface SceneTemplate {
  title: string
  body: string[]
  prompt: string
  imageKey: ImageKey
  choices: StoryChoice[]
  memoryLabel?: string
  clueLabel?: string
}

export interface EndingTemplate {
  title: string
  body: string[]
  imageKey: ImageKey
}

export interface EndingStatusItem {
  label: string
  value: string
  tone?: 'neutral' | 'success' | 'warning' | 'danger'
}

export interface StoryTextData {
  intro: IntroTemplate
  scenes: Record<SceneId, SceneTemplate>
  transitions: Record<string, string>
  endings: Record<EndingId, EndingTemplate>
  ui: {
    brand: string
    memoryLabel: string
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
    exitKicker: string
    exitTitle: string
    exitBody: string
  }
}

export interface SceneContent {
  id: SceneId
  title: string
  body: string[]
  prompt: string
  image: string
  choices: StoryChoice[]
}

export interface IntroContent {
  kicker: string
  title: string
  body: string[]
  buttonLabel: string
  image: string
}

export interface EndingContent {
  id: EndingId
  title: string
  body: string[]
  image: string
  reasonSummary?: string[]
  statusItems?: EndingStatusItem[]
}

export interface HistoryEntry {
  id: number
  sceneId: SceneId | 'intro'
  text: string
}

export interface GameState {
  hasStarted: boolean
  memory: number
  maxMemory: number
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
  startAdventure(): void
  playEnding(kind: 'victory' | 'fail'): void
  resetToIdle(): void
  stopAll(): void
  toggleMuted(): void
}
