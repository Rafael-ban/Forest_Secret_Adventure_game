<template>
  <section class="story-panel">
    <div class="story-meta">
      <p class="story-kicker">{{ kicker }}</p>
      <div class="story-progress">
        <span class="story-progress-label">{{ progressLabel }}</span>
        <span class="story-progress-value">第 {{ sceneIndex }} / {{ sceneCount }} 幕</span>
      </div>
    </div>
    <h1 class="story-title">{{ title }}</h1>
    <div class="story-progress-track" aria-hidden="true">
      <span class="story-progress-fill" :style="{ width: `${progressPercent}%` }" />
    </div>
    <p
      v-if="transitionText"
      class="transition-text"
    >
      {{ transitionText }}
    </p>
    <p
      v-for="paragraph in body"
      :key="paragraph"
      class="story-text"
    >
      {{ paragraph }}
    </p>
    <p
      v-if="prompt"
      class="story-prompt"
    >
      {{ prompt }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  kicker: string
  title: string
  body: string[]
  prompt: string
  transitionText: string | null
  progressLabel: string
  sceneIndex: number
  sceneCount: number
}>()

const progressPercent = computed(() => {
  if (props.sceneCount <= 0) {
    return 0
  }

  return (props.sceneIndex / props.sceneCount) * 100
})
</script>
