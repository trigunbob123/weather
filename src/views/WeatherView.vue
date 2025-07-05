<template>
  <div class="weather-view">
    <div class="container-fluid">
      <!-- 標題 -->
      <div class="text-center mb-4">
        <h1 class="display-4 text-white fw-light">天氣查詢</h1>
        <p class="text-white-50">即時天氣資訊與 5 天預報</p>
      </div>

      <!-- 搜尋區域 -->
      <div class="row justify-content-center mb-4">
        <div class="col-lg-6 col-md-8">
          <SearchInput @weather-searched="handleWeatherSearched" />
        </div>
      </div>

      <!-- 錯誤訊息 -->
      <ErrorMessage 
        v-if="error && !loading"
        :message="error"
        :show-retry="true"
        @retry="handleRetry"
        @dismiss="clearError"
        class="mx-auto mb-4"
        style="max-width: 600px;"
      />

      <!-- 雙欄天氣顯示 -->
      <div class="row">
        <!-- 左欄 - 台北天氣 (固定) -->
        <div class="col-lg-6 mb-4">
          <div class="weather-column">
            <div class="column-header">
              <h3 class="text-white mb-3">
                <i class="bi bi-geo-alt-fill me-2"></i>台北
              </h3>
            </div>
            
            <!-- 台北天氣載入狀態 -->
            <div v-if="taipeiLoading" class="text-center">
              <LoadingSpinner size="40px" text="載入台北天氣..." />
            </div>
            
            <!-- 台北天氣資料 -->
            <div v-else-if="taipeiWeather">
              <WeatherCard :weather="taipeiWeather" class="mb-4" />
              
              <!-- 台北5天預報 -->
              <div v-if="taipeiForecast && taipeiForecast.forecasts.length > 0" class="mb-4">
                <h5 class="text-white mb-3">
                  <i class="bi bi-calendar3 me-2"></i>5 天預報
                </h5>
                <div class="forecast-grid">
                  <ForecastCard 
                    v-for="(dayForecast, index) in taipeiForecast.forecasts"
                    :key="index"
                    :forecast="dayForecast" 
                  />
                </div>
              </div>
              
              <!-- 台北詳細資訊 -->
              <WeatherDetails :weather="taipeiWeather" />
            </div>
          </div>
        </div>

        <!-- 右欄 - 搜尋結果 -->
        <div class="col-lg-6 mb-4">
          <div class="weather-column">
            <div class="column-header">
              <h3 class="text-white mb-3">
                <i class="bi bi-search me-2"></i>
                {{ searchedWeather ? searchedWeather.city : '搜尋結果' }}
              </h3>
            </div>
            
            <!-- 搜尋結果載入狀態 -->
            <div v-if="searchLoading" class="text-center">
              <LoadingSpinner size="40px" text="載入天氣資料中..." />
            </div>
            
            <!-- 搜尋結果天氣資料 -->
            <div v-else-if="searchedWeather">
              <WeatherCard :weather="searchedWeather" class="mb-4" />
              
              <!-- 搜尋結果5天預報 -->
              <div v-if="searchedForecast && searchedForecast.forecasts.length > 0" class="mb-4">
                <h5 class="text-white mb-3">
                  <i class="bi bi-calendar3 me-2"></i>5 天預報
                </h5>
                <div class="forecast-grid">
                  <ForecastCard 
                    v-for="(dayForecast, index) in searchedForecast.forecasts"
                    :key="index"
                    :forecast="dayForecast" 
                  />
                </div>
              </div>
              
              <!-- 搜尋結果詳細資訊 -->
              <WeatherDetails :weather="searchedWeather" />
            </div>
            
            <!-- 未搜尋時的提示 -->
            <div v-else class="no-search-result">
              <div class="text-center text-white-50 py-5">
                <i class="bi bi-search display-1 mb-3 opacity-50"></i>
                <h4>搜尋城市天氣</h4>
                <p>在上方搜尋框輸入城市名稱</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部 - 收藏和歷史 -->
      <div class="row mt-4">
        <div class="col-md-6" v-if="favorites.length > 0">
          <FavoritesList @city-selected="handleFavoriteSelected" />
        </div>
        <div class="col-md-6" v-if="recentSearches.length > 0">
          <HistoryList @city-selected="handleHistorySelected" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWeatherStore } from '@/stores/weather'
import { useFavoritesStore } from '@/stores/favorites'
import { useHistoryStore } from '@/stores/history'
import weatherAPI from '@/services/weatherApi'

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

// 台北天氣資料
const taipeiWeather = ref(null)
const taipeiForecast = ref(null)
const taipeiLoading = ref(false)

// 搜尋結果資料
const searchedWeather = ref(null)
const searchedForecast = ref(null)
const searchLoading = ref(false)

// 錯誤處理
const error = ref(null)

// Computed
const favorites = computed(() => favoritesStore.getFavorites)
const recentSearches = computed(() => historyStore.recentSearches)
const loading = computed(() => taipeiLoading.value || searchLoading.value)

// 載入台北天氣
const loadTaipeiWeather = async () => {
  taipeiLoading.value = true
  error.value = null
  
  try {
    const [weather, forecast] = await Promise.all([
      weatherAPI.getCurrentWeather('Taipei'),
      weatherAPI.getForecast('Taipei')
    ])
    
    taipeiWeather.value = weather
    taipeiForecast.value = forecast
  } catch (err) {
    error.value = '無法載入台北天氣資料'
    console.error('Load Taipei weather error:', err)
  } finally {
    taipeiLoading.value = false
  }
}

// 處理搜尋結果
const handleWeatherSearched = async (cityName) => {
  searchLoading.value = true
  error.value = null
  
  try {
    const [weather, forecast] = await Promise.all([
      weatherAPI.getCurrentWeather(cityName),
      weatherAPI.getForecast(cityName)
    ])
    
    searchedWeather.value = weather
    searchedForecast.value = forecast
    
    // 加入搜尋歷史
    historyStore.addToHistory(cityName)
  } catch (err) {
    error.value = err.message || '搜尋城市天氣失敗'
    console.error('Search weather error:', err)
  } finally {
    searchLoading.value = false
  }
}

// 處理收藏選擇
const handleFavoriteSelected = (cityName) => {
  handleWeatherSearched(cityName)
}

// 處理歷史選擇
const handleHistorySelected = (cityName) => {
  handleWeatherSearched(cityName)
}

// 重試功能
const handleRetry = () => {
  if (!taipeiWeather.value) {
    loadTaipeiWeather()
  }
  if (searchedWeather.value) {
    handleWeatherSearched(searchedWeather.value.city)
  }
}

// 清除錯誤
const clearError = () => {
  error.value = null
}

// 生命週期
onMounted(async () => {
  // 載入本地資料
  favoritesStore.loadFavorites()
  historyStore.loadHistory()
  
  // 載入台北天氣
  await loadTaipeiWeather()
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

.weather-column {
  height: 100%;
}

.column-header {
  position: sticky;
  top: 20px;
  z-index: 10;
  margin-bottom: 1rem;
}

.forecast-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 15px;
}

.no-search-result {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 991.98px) {
  .forecast-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
  
  .weather-column {
    margin-bottom: 2rem;
  }
}

@media (max-width: 575.98px) {
  .forecast-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>