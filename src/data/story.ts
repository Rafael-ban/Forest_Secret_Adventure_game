import introVillageGate from '../assets/images/intro-village-gate.png'
import scene1StoneStele from '../assets/images/scene1-stone-stele.png'
import scene2FogCrossroads from '../assets/images/scene2-fog-crossroads.png'
import scene3MirrorLake from '../assets/images/scene3-mirror-lake.png'
import scene4DarkSwamp from '../assets/images/scene4-dark-swamp.png'
import scene5BrokenBridgeAltar from '../assets/images/scene5-broken-bridge-altar.png'
import scene6HeartTreeClearing from '../assets/images/scene6-heart-tree-clearing.png'
import endingFailLostMemory from '../assets/images/ending-fail-lost-memory.png'
import endingVictoryRescue from '../assets/images/ending-victory-rescue.png'
import endingHiddenBlessing from '../assets/images/ending-hidden-blessing.png'
import storyContent from './story-content.json'
import type {
  EndingContent,
  EndingId,
  ImageKey,
  IntroContent,
  SceneId,
  StoryTextData
} from '../types/game'

export const storyData = storyContent as StoryTextData

export const imageAssets: Record<ImageKey, string> = {
  intro: introVillageGate,
  scene1: scene1StoneStele,
  scene2: scene2FogCrossroads,
  scene3: scene3MirrorLake,
  scene4: scene4DarkSwamp,
  scene5: scene5BrokenBridgeAltar,
  scene6: scene6HeartTreeClearing,
  fail: endingFailLostMemory,
  victory: endingVictoryRescue,
  hidden: endingHiddenBlessing
}

export const introContent: IntroContent = {
  ...storyData.intro,
  image: imageAssets[storyData.intro.imageKey]
}

export function getSceneImage(sceneId: SceneId) {
  return imageAssets[storyData.scenes[sceneId].imageKey]
}

export const endings: Record<EndingId, EndingContent> = {
  fail: {
    id: 'fail',
    title: storyData.endings.fail.title,
    body: storyData.endings.fail.body,
    image: imageAssets[storyData.endings.fail.imageKey]
  },
  victory: {
    id: 'victory',
    title: storyData.endings.victory.title,
    body: storyData.endings.victory.body,
    image: imageAssets[storyData.endings.victory.imageKey]
  },
  hidden: {
    id: 'hidden',
    title: storyData.endings.hidden.title,
    body: storyData.endings.hidden.body,
    image: imageAssets[storyData.endings.hidden.imageKey]
  }
}
