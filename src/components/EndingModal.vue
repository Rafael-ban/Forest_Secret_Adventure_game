<template>
  <div class="ending-modal">
    <div class="ending-backdrop" />
    <section class="ending-panel" aria-label="结局">
      <img
        class="ending-image"
        :src="ending.image"
        :alt="ending.title"
      />
      <div class="ending-copy">
        <p class="ending-kicker">{{ uiText.resultLabel }}</p>
        <h2>{{ ending.title }}</h2>
        <p
          v-for="paragraph in ending.body"
          :key="paragraph"
          class="ending-text"
        >
          {{ paragraph }}
        </p>
        <div
          v-if="ending.reasonSummary?.length"
          class="ending-section"
        >
          <p class="ending-section-label">{{ uiText.endingReasonLabel }}</p>
          <p
            v-for="reason in ending.reasonSummary"
            :key="reason"
            class="ending-reason-text"
          >
            {{ reason }}
          </p>
        </div>
        <div
          v-if="ending.statusItems?.length"
          class="ending-section"
        >
          <p class="ending-section-label">{{ uiText.endingStatusLabel }}</p>
          <dl class="ending-status-grid">
            <div
              v-for="item in ending.statusItems"
              :key="item.label"
              class="ending-status-item"
              :class="item.tone ? `is-${item.tone}` : 'is-neutral'"
            >
              <dt>{{ item.label }}</dt>
              <dd>{{ item.value }}</dd>
            </div>
          </dl>
        </div>
      </div>
      <div class="ending-actions">
        <button
          class="primary-action"
          type="button"
          @click="$emit('restart')"
        >
          {{ uiText.restartLabel }}
        </button>
        <button
          class="secondary-action"
          type="button"
          @click="$emit('exit')"
        >
          {{ uiText.exitLabel }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { EndingContent } from '../types/game'

defineProps<{
  ending: EndingContent
  uiText: {
    resultLabel: string
    endingReasonLabel: string
    endingStatusLabel: string
    restartLabel: string
    exitLabel: string
  }
}>()

defineEmits<{
  restart: []
  exit: []
}>()
</script>
