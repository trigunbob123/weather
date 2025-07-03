<template>
  <div class="loading-container" :class="{ 'inline': inline }">
    <div class="loading-spinner" :style="{ width: size, height: size }"></div>
    <span v-if="text" class="loading-text ms-2">{{ text }}</span>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
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
  }
}
</script>

<style scoped>
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.loading-container.inline {
  display: inline-flex;
  padding: 0;
}

.loading-text {
  color: #6c757d;
  font-size: 0.9rem;
}
</style>