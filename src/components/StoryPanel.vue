<template>
  <section class="story-panel">
    <p class="story-kicker">{{ kicker }}</p>
    <h1 class="story-title">{{ title }}</h1>
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
defineProps<{
  kicker: string
  title: string
  body: string[]
  prompt: string
  transitionText: string | null
}>()
</script>
