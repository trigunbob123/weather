<template>
  <div class="search-container">
    <div class="input-group">
      <input
        v-model="searchQuery"
        @input="handleInput"
        @keydown="handleKeydown"
        @focus="showSuggestions = true"
        @blur="handleBlur"
        type="text"
        class="form-control search-input"
        placeholder="搜尋城市名稱..."
        :disabled="loading"
      >
      <button 
        @click="handleSearch"
        class="btn btn-primary"
        :disabled="loading || !searchQuery.trim()"
      >
        <LoadingSpinner v-if="loading" size="16px" inline />
        <i v-else class="bi bi-search"></i>
      </button>
      <button 
        @click="getCurrentLocation"
        class="btn btn-outline-secondary"
        :disabled="gettingLocation"
        title="使用我的位置"
      >
        <LoadingSpinner v-if="gettingLocation" size="16px" inline />
        <i v-else class="bi bi-geo-alt"></i>
      </button>
    </div>

    <!-- 搜尋建議 -->
    <div 
      v-if="showSuggestions && (suggestions.length > 0 || recentSearches.length > 0)"
      class="suggestions-dropdown"
    >
      <!-- API 搜尋結果 -->
      <div v-if="suggestions.length > 0">
        <h6 class="suggestions-header">搜尋結果</h6>
        <div
          v-for="(suggestion, index) in suggestions"
          :key="suggestion.name + suggestion.country"
          @click="selectSuggestion(suggestion)"
          class="suggestion-item"
          :class="{ active: selectedIndex === index }"
        >
          <i class="bi bi-geo-alt me-2"></i>
          {{ suggestion.displayName }}
        </div>
      </div>

      <!-- 搜尋歷史 -->
      <div v-if="recentSearches.length > 0 && !searchQuery.trim()">
        <h6 class="suggestions-header">最近搜尋</h6>
        <div
          v-for="(item, index) in recentSearches"
          :key="item.id"
          @click="selectHistory(item)"
          class="suggestion-item"
          :class="{ active: selectedIndex === (suggestions.length + index) }"
        >
          <i class="bi bi-clock-history me-2"></i>
          {{ item.name }}
          <button
            @click.stop="removeHistory(item)"
            class="btn btn-sm btn-outline-danger ms-auto"
          >
            <i class="bi bi-x"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useWeatherStore } from '@/stores/weather'
import { useHistoryStore } from '@/stores/history'
import { useLocationStore } from '@/stores/location'
import weatherAPI from '@/services/weatherApi'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

export default {
  name: 'SearchInput',
  components: {
    LoadingSpinner
  },
  setup() {
    const weatherStore = useWeatherStore()
    const historyStore = useHistoryStore()
    const locationStore = useLocationStore()

    const searchQuery = ref('')
    const suggestions = ref([])
    const showSuggestions = ref(false)
    const selectedIndex = ref(-1)
    const searchTimeout = ref(null)
    const loading = ref(false)

    const gettingLocation = computed(() => locationStore.isLocationLoading)
    const recentSearches = computed(() => historyStore.recentSearches)

    // 防抖搜尋
    const handleInput = () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
      }

      selectedIndex.value = -1

      if (searchQuery.value.trim().length >= 2) {
        searchTimeout.value = setTimeout(async () => {
          await searchCities()
        }, 300)
      } else {
        suggestions.value = []
      }
    }

    const searchCities = async () => {
      try {
        const results = await weatherAPI.searchCities(searchQuery.value.trim())
        suggestions.value = results.slice(0, 5)
      } catch (error) {
        console.error('City search error:', error)
        suggestions.value = []
      }
    }

    const handleKeydown = (event) => {
      const totalItems = suggestions.value.length + 
        (searchQuery.value.trim() ? 0 : recentSearches.value.length)

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          selectedIndex.value = Math.min(selectedIndex.value + 1, totalItems - 1)
          break
        case 'ArrowUp':
          event.preventDefault()
          selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
          break
        case 'Enter':
          event.preventDefault()
          if (selectedIndex.value >= 0) {
            selectByIndex()
          } else {
            handleSearch()
          }
          break
        case 'Escape':
          showSuggestions.value = false
          selectedIndex.value = -1
          break
      }
    }

    const selectByIndex = () => {
      if (selectedIndex.value < suggestions.value.length) {
        selectSuggestion(suggestions.value[selectedIndex.value])
      } else {
        const historyIndex = selectedIndex.value - suggestions.value.length
        selectHistory(recentSearches.value[historyIndex])
      }
    }

    const selectSuggestion = (suggestion) => {
      searchQuery.value = suggestion.name
      showSuggestions.value = false
      selectedIndex.value = -1
      handleSearch()
    }

    const selectHistory = (item) => {
      searchQuery.value = item.name
      showSuggestions.value = false
      selectedIndex.value = -1
      handleSearch()
    }

    const removeHistory = (item) => {
      historyStore.removeFromHistory(item.name)
    }

    const handleSearch = async () => {
      const city = searchQuery.value.trim()
      if (!city) return

      loading.value = true
      try {
        await weatherStore.fetchWeatherByCity(city)
        if (weatherStore.currentWeather) {
          historyStore.addToHistory(city)
          showSuggestions.value = false
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        loading.value = false
      }
    }

    const getCurrentLocation = async () => {
      const success = await locationStore.getCurrentLocation()
      if (success && locationStore.userLocation) {
        const { lat, lon } = locationStore.userLocation
        await weatherStore.fetchWeatherByCoords(lat, lon)
      }
    }

    const handleBlur = () => {
      // 延遲隱藏建議，讓點擊事件可以觸發
      setTimeout(() => {
        showSuggestions.value = false
      }, 200)
    }

    return {
      searchQuery,
      suggestions,
      showSuggestions,
      selectedIndex,
      loading,
      gettingLocation,
      recentSearches,
      handleInput,
      handleKeydown,
      selectSuggestion,
      selectHistory,
      removeHistory,
      handleSearch,
      getCurrentLocation,
      handleBlur
    }
  }
}
</script>

<style scoped>
.search-container {
  position: relative;
  margin-bottom: 2rem;
}

.search-input {
  border-radius: 8px 0 0 8px;
  border-right: none;
  font-size: 1.1rem;
  padding: 12px 16px;
}

.search-input:focus {
  box-shadow: 0 0 0 0.2rem rgba(52, 152, 219, 0.25);
  border-color: #3498db;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
}

.suggestions-header {
  padding: 12px 16px 8px;
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: #6c757d;
  border-bottom: 1px solid #f8f9fa;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f8f9fa;
}

.suggestion-item:hover,
.suggestion-item.active {
  background-color: #f8f9fa;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.btn-group .btn {
  border-radius: 0;
}

.btn-group .btn:last-child {
  border-radius: 0 8px 8px 0;
}
</style>