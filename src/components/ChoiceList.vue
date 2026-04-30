<template>
  <section
    v-if="choices.length"
    class="choice-list"
    aria-label="剧情选项"
  >
    <button
      v-for="(choice, index) in choices"
      :key="choice.id"
      class="choice-button"
      type="button"
      @click="$emit('select', choice.id)"
    >
      <span class="choice-index">{{ String(index + 1).padStart(2, '0') }}</span>
      <span class="choice-copy">
        <span class="choice-topline">
          <span class="choice-text">{{ choice.label }}</span>
          <span v-if="choice.toneLabel" class="choice-tone">{{ choice.toneLabel }}</span>
        </span>
        <span v-if="choice.effectHint" class="choice-hint">{{ choice.effectHint }}</span>
      </span>
    </button>
  </section>
</template>

<script setup lang="ts">
import type { StoryChoice } from '../types/game'

defineProps<{
  choices: StoryChoice[]
}>()

defineEmits<{
  select: [choiceId: string]
}>()
</script>
