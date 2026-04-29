<template>
  <section class="status-panel" aria-label="状态栏">
    <div class="hud-item">
      <span class="hud-label">{{ memoryLabel }}</span>
      <strong class="hud-value">{{ memory }}/{{ maxMemory }}</strong>
    </div>
    <div class="hud-item">
      <span class="hud-label">{{ stageLabel }}</span>
      <strong class="hud-value">{{ locationName }}</strong>
    </div>
    <div class="hud-item">
      <span class="hud-label">{{ clueLabel }}</span>
      <strong class="hud-value">{{ truthClueCount }}</strong>
    </div>
    <button
      class="hud-item hud-audio"
      type="button"
      @click="$emit('toggle-audio')"
    >
      <span class="hud-label">{{ audioLabel }}</span>
      <strong class="hud-value">{{ audioMuted ? unmuteLabel : muteLabel }}</strong>
    </button>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  memory: number
  maxMemory: number
  locationName: string
  truthClueCount: number
  audioMuted: boolean
  memoryLabel: string
  stageLabel: string
  clueLabel: string
  audioLabel: string
  muteLabel: string
  unmuteLabel: string
}>()

defineEmits<{
  'toggle-audio': []
}>()
</script>
