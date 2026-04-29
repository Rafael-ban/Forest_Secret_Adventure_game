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
      v-if="!state.hasStarted"
      class="intro-screen"
    >
      <div class="intro-card">
        <p class="scene-kicker">{{ introContent.kicker }}</p>
        <h1>{{ introContent.title }}</h1>
        <p
          v-for="paragraph in introContent.body"
          :key="paragraph"
          class="intro-text"
        >
          {{ paragraph }}
        </p>
        <div class="intro-actions">
          <button
            class="primary-action"
            type="button"
            @click="startGame"
          >
            {{ introContent.buttonLabel }}
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
  introContent,
  currentScene,
  currentEnding,
  activeChoices,
  locationName,
  uiText,
  startGame,
  chooseOption,
  restart,
  exitGame,
  toggleAudio
} = useGameEngine()

const scenePresentationKey = computed(() => `${state.currentSceneId}-${state.history.length}`)

const activeImage = computed(() => {
  if (!state.hasStarted) {
    return introContent.image
  }

  return currentEnding.value?.image ?? currentScene.value.image
})

const activeAlt = computed(() => {
  if (!state.hasStarted) {
    return introContent.title
  }

  return currentEnding.value?.title ?? currentScene.value.title
})
</script>
