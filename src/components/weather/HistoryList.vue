<template>
  <div class="history-list card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h6 class="mb-0">
        <i class="bi bi-clock-history me-2"></i>搜尋歷史
      </h6>
      <button 
        @click="clearAllHistory"
        class="btn btn-sm btn-outline-danger"
        v-if="history.length > 0"
      >
        清除全部
      </button>
    </div>
    <div class="card-body">
      <div v-if="history.length === 0" class="text-muted text-center py-3">
        <i class="bi bi-clock display-6 mb-2"></i>
        <p class="mb-0">沒有搜尋歷史</p>
      </div>
      <div v-else class="history-grid">
        <div 
          v-for="item in history"
          :key="item.id"
          @click="selectHistory(item)"
          class="history-item"
        >
          <div class="history-content">
            <div class="history-name">{{ item.name }}</div>
            <div class="history-time">{{ getTimeAgo(item.searchedAt) }}</div>
          </div>
          <button
            @click.stop="removeHistory(item)"
            class="btn btn-sm btn-outline-secondary"
            title="移除歷史"
          >
            <i class="bi bi-x"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useHistoryStore } from '@/stores/history'
import { useWeatherStore } from '@/stores/weather'
import { getTimeAgo } from '@/utils/dateUtils'

// Stores
const historyStore = useHistoryStore()
const weatherStore = useWeatherStore()

// Computed
const history = computed(() => historyStore.getHistory)

// Methods
const selectHistory = async (item) => {
  await weatherStore.fetchWeatherByCity(item.name)
}

const removeHistory = (item) => {
  historyStore.removeFromHistory(item.name)
}

const clearAllHistory = () => {
  historyStore.clearHistory()
}
</script>

<style scoped>
.history-list {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.history-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: rgba(248, 249, 250, 0.6);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.history-item:hover {
  background: rgba(108, 117, 125, 0.1);
  transform: translateX(4px);
}

.history-content {
  flex: 1;
}

.history-name {
  font-weight: 600;
  color: #2c3e50;
}

.history-time {
  font-size: 0.8rem;
  color: #6c757d;
}
</style>