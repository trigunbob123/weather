<template>
  <div class="loading-container" :class="{ 'inline': inline }">
    <div class="loading-spinner" :style="{ width: size, height: size }"></div>
    <span v-if="text" class="loading-text ms-2">{{ text }}</span>
  </div>
</template>

<script setup>
// Props 定義 (JavaScript 版本)
const props = defineProps({
  size: {
    type: String,
    default: '20px'
  },
  text: {
    type: String,
    default: ''
  },
  inline: {
    type: Boolean,
    default: false
  }
})
</script>