<template>
  <div class="alert alert-danger d-flex align-items-center" role="alert">
    <i class="bi bi-exclamation-triangle-fill me-2"></i>
    <div>
      <strong>錯誤：</strong>{{ message }}
      <button 
        v-if="showRetry" 
        @click="emit('retry')"
        class="btn btn-sm btn-outline-danger ms-3"
      >
        重試
      </button>
    </div>
    <button 
      v-if="dismissible"
      @click="emit('dismiss')"
      type="button" 
      class="btn-close ms-auto"
    ></button>
  </div>
</template>

<script setup>
// Props 定義 (JavaScript 版本)
const props = defineProps({
  message: {
    type: String,
    required: true
  },
  showRetry: {
    type: Boolean,
    default: false
  },
  dismissible: {
    type: Boolean,
    default: true
  }
})

// Emits 定義
const emit = defineEmits(['retry', 'dismiss'])
</script>