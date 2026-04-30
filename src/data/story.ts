import endingFailLostName from '../assets/images/ending-fail-lost-name.png'
import endingHiddenRenewedPact from '../assets/images/ending-hidden-renewed-pact.png'
import endingVictoryDebtUnpaid from '../assets/images/ending-victory-debt-unpaid.png'
import introVillageGate from '../assets/images/intro-village-gate.png'
import homeHero from '../assets/images/scene2-fog-crossroads.png'
import scene1SisterRoom from '../assets/images/scene1-sister-room.png'
import scene2ForestStele from '../assets/images/scene2-forest-stele.png'
import scene3RedClothTrail from '../assets/images/scene3-red-cloth-trail.png'
import scene4HuntersHut from '../assets/images/scene4-hunters-hut.png'
import scene5EchoRavine from '../assets/images/scene5-echo-ravine.png'
import scene6MirrorLake from '../assets/images/scene6-mirror-lake.png'
import scene7LostNameGrove from '../assets/images/scene7-lost-name-grove.png'
import scene8DarkSwamp from '../assets/images/scene8-dark-swamp.png'
import scene9BrokenBridgeAltar from '../assets/images/scene9-broken-bridge-altar.png'
import scene10SunkenBellCorridor from '../assets/images/scene10-sunken-bell-corridor.png'
import scene11HeartTreeAntechamber from '../assets/images/scene11-heart-tree-antechamber.png'
import scene12HeartTreeClearing from '../assets/images/scene12-heart-tree-clearing.png'
import scene13WardenCamp from '../assets/images/scene1-stone-stele.png'
import scene14OathBellCourt from '../assets/images/scene5-broken-bridge-altar.png'
import scene15LampTrail from '../assets/images/scene6-heart-tree-clearing.png'
import storyContent from './story-content.json'
import type {
  ChapterId,
  EndingContent,
  EndingId,
  ImageKey,
  PageContent,
  SceneId,
  StoryChapterTemplate,
  StoryTextData
} from '../types/game'

export const DEFAULT_CHAPTER_ID: ChapterId = 'chapter1'
export const storyData = storyContent as StoryTextData

export const imageAssets: Record<ImageKey, string> = {
  home: homeHero,
  prologue: introVillageGate,
  scene1: scene1SisterRoom,
  scene2: scene2ForestStele,
  scene3: scene3RedClothTrail,
  scene4: scene4HuntersHut,
  scene5: scene5EchoRavine,
  scene6: scene6MirrorLake,
  scene7: scene7LostNameGrove,
  scene8: scene8DarkSwamp,
  scene9: scene9BrokenBridgeAltar,
  scene10: scene10SunkenBellCorridor,
  scene11: scene11HeartTreeAntechamber,
  scene12: scene12HeartTreeClearing,
  scene13: scene13WardenCamp,
  scene14: scene14OathBellCourt,
  scene15: scene15LampTrail,
  fail: endingFailLostName,
  victory: endingVictoryDebtUnpaid,
  hidden: endingHiddenRenewedPact
}

export function getChapter(chapterId: ChapterId = DEFAULT_CHAPTER_ID): StoryChapterTemplate {
  return storyData.chapters[chapterId]
}

function resolvePageContent(
  chapterId: ChapterId,
  key: 'home' | 'prologue'
): PageContent {
  const page = getChapter(chapterId)[key]

  return {
    ...page,
    image: imageAssets[page.imageKey]
  }
}

export function getHomeContent(chapterId: ChapterId = DEFAULT_CHAPTER_ID): PageContent {
  return resolvePageContent(chapterId, 'home')
}

export function getPrologueContent(chapterId: ChapterId = DEFAULT_CHAPTER_ID): PageContent {
  return resolvePageContent(chapterId, 'prologue')
}

export function getSceneImage(chapterId: ChapterId, sceneId: SceneId) {
  return imageAssets[getChapter(chapterId).scenes[sceneId].imageKey]
}

export function getEndingContent(
  chapterId: ChapterId,
  endingId: EndingId
): EndingContent {
  const ending = getChapter(chapterId).endings[endingId]

  return {
    id: endingId,
    title: ending.title,
    body: ending.body,
    image: imageAssets[ending.imageKey],
    musicCue: ending.musicCue
  }
}
