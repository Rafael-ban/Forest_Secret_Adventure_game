<template>
  <section
    v-if="choices.length"
    class="choice-list"
    aria-label="选项列表"
  >
    <button
      v-for="(choice, index) in choices"
      :key="choice.id"
      class="choice-button"
      type="button"
      @click="$emit('select', choice.id)"
    >
      <span class="choice-index">{{ String(index + 1).padStart(2, '0') }}</span>
      <span class="choice-copy">{{ choice.label }}</span>
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
