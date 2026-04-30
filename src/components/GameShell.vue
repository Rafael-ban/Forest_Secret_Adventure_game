<template>
  <main class="game-shell">
    <div class="scene-backdrop">
      <img
        class="scene-image"
        :src="activeImage"
        :alt="activeAlt"
      />
    </div>

    <section
      v-if="state.view === 'home'"
      class="home-screen"
    >
      <div class="home-copy">
        <p class="scene-kicker">{{ homeContent.kicker }}</p>
        <h1>{{ homeContent.title }}</h1>
        <p
          v-for="paragraph in homeContent.body"
          :key="paragraph"
          class="intro-text"
        >
          {{ paragraph }}
        </p>
        <div class="intro-actions">
          <button
            class="primary-action"
            type="button"
            @click="enterPrologue"
          >
            {{ homeContent.buttonLabel }}
          </button>
          <button
            class="secondary-action"
            type="button"
            @click="toggleAudio"
          >
            {{ state.audioMuted ? uiText.unmuteLabel : uiText.muteLabel }}
          </button>
        </div>
      </div>
    </section>

    <section
      v-else-if="state.view === 'prologue'"
      class="prologue-screen"
    >
      <div class="intro-card">
        <p class="scene-kicker">{{ prologueContent.kicker }}</p>
        <h1>{{ prologueContent.title }}</h1>
        <p
          v-for="paragraph in prologueContent.body"
          :key="paragraph"
          class="intro-text"
        >
          {{ paragraph }}
        </p>
        <div class="intro-actions">
          <button
            class="primary-action"
            type="button"
            @click="startAdventure"
          >
            {{ prologueContent.buttonLabel }}
          </button>
          <button
            class="secondary-action"
            type="button"
            @click="toggleAudio"
          >
            {{ state.audioMuted ? uiText.unmuteLabel : uiText.muteLabel }}
          </button>
        </div>
      </div>
    </section>

    <template v-else>
      <section class="game-layout">
        <StatusPanel
          :memory="state.memory"
          :max-memory="state.maxMemory"
          :location-name="locationName"
          :truth-clue-count="state.truthClueCount"
          :audio-muted="state.audioMuted"
          :memory-label="uiText.memoryLabel"
          :stage-label="uiText.stageLabel"
          :clue-label="uiText.clueLabel"
          :audio-label="uiText.audioLabel"
          :mute-label="uiText.muteLabel"
          :unmute-label="uiText.unmuteLabel"
          @toggle-audio="toggleAudio"
        />

        <div class="story-stage-shell">
          <div :key="scenePresentationKey" class="story-stage">
            <StoryPanel
              :kicker="uiText.brand"
              :title="locationName"
              :body="currentScene.body"
              :prompt="currentScene.prompt"
              :transition-text="state.transitionText"
              :progress-label="uiText.progressLabel"
              :scene-index="sceneIndex"
              :scene-count="sceneCount"
            />

            <ChoiceList
              :choices="activeChoices"
              @select="chooseOption"
            />
          </div>
        </div>
      </section>

      <EndingModal
        v-if="currentEnding"
        :ending="currentEnding"
        :ui-text="uiText"
        @restart="restart"
        @exit="exitGame"
      />
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ChoiceList from './ChoiceList.vue'
import EndingModal from './EndingModal.vue'
import StatusPanel from './StatusPanel.vue'
import StoryPanel from './StoryPanel.vue'
import { useGameEngine } from '../composables/useGameEngine'

const {
  state,
  homeContent,
  prologueContent,
  currentScene,
  currentEnding,
  activeChoices,
  locationName,
  sceneIndex,
  sceneCount,
  uiText,
  enterPrologue,
  startAdventure,
  chooseOption,
  restart,
  exitGame,
  toggleAudio
} = useGameEngine()

const scenePresentationKey = computed(() => `${state.currentSceneId}-${state.history.length}`)

const activeImage = computed(() => {
  if (state.view === 'home') {
    return homeContent.value.image
  }

  if (state.view === 'prologue') {
    return prologueContent.value.image
  }

  return currentEnding.value?.image ?? currentScene.value.image
})

const activeAlt = computed(() => {
  if (state.view === 'home') {
    return homeContent.value.title
  }

  if (state.view === 'prologue') {
    return prologueContent.value.title
  }

  return currentEnding.value?.title ?? currentScene.value.title
})
</script>
