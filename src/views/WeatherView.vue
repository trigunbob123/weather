<template>
  <div class="weather-view">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <!-- 標題 -->
          <div class="text-center mb-4">
            <h1 class="display-4 text-white fw-light">天氣查詢</h1>
            <p class="text-white-50">即時天氣資訊與 5 天預報</p>
          </div>

          <!-- 搜尋區域 -->
          <SearchInput />

          <!-- 錯誤訊息 -->
          <ErrorMessage 
            v-if="error && !loading"
            :message="error"
            :show-retry="true"
            @retry="handleRetry"
            @dismiss="clearError"
          />

          <!-- 載入狀態 -->
          <div v-if="loading" class="text-center">
            <LoadingSpinner size="40px" text="載入天氣資料中..." />
          </div>

          <!-- 天氣資料 -->
          <div v-else-if="currentWeather">
            <!-- 當前天氣卡片 -->
            <WeatherCard :weather="currentWeather" class="mb-4" />

            <!-- 5天預報 -->
            <div v-if="forecast && forecast.forecasts.length > 0" class="mb-4">
              <h4 class="text-white mb-3">
                <i class="bi bi-calendar3 me-2"></i>5 天預報
              </h4>
              <div class="row g-3">
                <div 
                  v-for="(dayForecast, index) in forecast.forecasts"
                  :key="index"
                  class="col-md-2 col-sm-6"
                >
                  <ForecastCard :forecast="dayForecast" />
                </div>
              </div>
            </div>

            <!-- 詳細資訊 -->
            <WeatherDetails :weather="currentWeather" />
          </div>

          <!-- 收藏和歷史 -->
          <div class="row mt-4" v-if="favorites.length > 0 || recentSearches.length > 0">
            <div class="col-md-6" v-if="favorites.length > 0">
              <FavoritesList />
            </div>
            <div class="col-md-6" v-if="recentSearches.length > 0">
              <HistoryList />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useWeatherStore } from '@/stores/weather'
import { useFavoritesStore } from '@/stores/favorites'
import { useHistoryStore } from '@/stores/history'

import SearchInput from '@/components/weather/SearchInput.vue'
import WeatherCard from '@/components/weather/WeatherCard.vue'
import ForecastCard from '@/components/weather/ForecastCard.vue'
import WeatherDetails from '@/components/weather/WeatherDetails.vue'
import FavoritesList from '@/components/weather/FavoritesList.vue'
import HistoryList from '@/components/weather/HistoryList.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'

// Stores
const weatherStore = useWeatherStore()
const favoritesStore = useFavoritesStore()
const historyStore = useHistoryStore()

// Computed
const currentWeather = computed(() => weatherStore.currentWeather)
const forecast = computed(() => weatherStore.forecast)
const loading = computed(() => weatherStore.isLoading)
const error = computed(() => weatherStore.getError)
const favorites = computed(() => favoritesStore.getFavorites)
const recentSearches = computed(() => historyStore.recentSearches)

// Methods
const handleRetry = () => {
  if (currentWeather.value) {
    weatherStore.refreshWeather()
  }
}

const clearError = () => {
  weatherStore.clearError()
}

// Lifecycle
onMounted(() => {
  favoritesStore.loadFavorites()
  historyStore.loadHistory()
})
</script>

<style scoped>
.weather-view {
  min-height: 100vh;
  padding: 40px 0;
}

.display-4 {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
</style>