<template>
  <div class="favorites-list card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h6 class="mb-0">
        <i class="bi bi-star-fill text-warning me-2"></i>收藏城市
      </h6>
      <span class="badge bg-secondary">{{ favorites.length }}</span>
    </div>
    <div class="card-body">
      <div v-if="favorites.length === 0" class="text-muted text-center py-3">
        <i class="bi bi-star display-6 mb-2"></i>
        <p class="mb-0">尚未收藏任何城市</p>
      </div>
      <div v-else class="favorites-grid">
        <div 
          v-for="favorite in favorites"
          :key="favorite.id"
          @click="selectFavorite(favorite)"
          class="favorite-item"
        >
          <div class="favorite-content">
            <div class="favorite-name">{{ favorite.name }}</div>
            <div class="favorite-country">{{ favorite.country }}</div>
          </div>
          <button
            @click.stop="removeFavorite(favorite)"
            class="btn btn-sm btn-outline-danger"
            title="移除收藏"
          >
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useFavoritesStore } from '@/stores/favorites'

// 定義 emits
const emit = defineEmits(['city-selected'])

// Stores
const favoritesStore = useFavoritesStore()

// Computed
const favorites = computed(() => favoritesStore.getFavorites)

// Methods
const selectFavorite = (favorite) => {
  emit('city-selected', favorite.name)
}

const removeFavorite = (favorite) => {
  favoritesStore.removeFavorite(favorite.name)
}
</script>

<style scoped>
.favorites-list {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.favorites-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.favorite-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: rgba(248, 249, 250, 0.6);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.favorite-item:hover {
  background: rgba(52, 152, 219, 0.1);
  transform: translateX(4px);
}

.favorite-content {
  flex: 1;
}

.favorite-name {
  font-weight: 600;
  color: #2c3e50;
}

.favorite-country {
  font-size: 0.85rem;
  color: #6c757d;
}
</style>