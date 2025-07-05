<template>
  <div class="weather-card card">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h3 class="card-title mb-1">{{ weather.city }}</h3>
          <p class="text-muted mb-0">
            {{ weather.country }} • {{ formatDate(weather.updatedAt) }}
          </p>
        </div>
        <button 
          @click="toggleFavorite"
          class="btn btn-link text-decoration-none p-1"
          :class="{ 'text-warning': isFavorite, 'text-muted': !isFavorite }"
        >
          <i class="bi" :class="isFavorite ? 'bi-star-fill' : 'bi-star'"></i>
        </button>
      </div>

      <div class="row align-items-center">
        <div class="col-6">
          <div class="temperature-display">
            <span class="temperature">{{ weather.temperature }}°</span>
            <span class="feels-like">體感 {{ weather.feelsLike }}°</span>
          </div>
          <p class="weather-description">{{ weather.description }}</p>
        </div>
        <div class="col-6 text-end">
          <img 
            :src="getWeatherIcon(weather.icon)" 
            :alt="weather.description"
            class="weather-icon"
          >
        </div>
      </div>

      <div class="row mt-3">
        <div class="col-4 text-center">
          <i class="bi bi-droplet text-info"></i>
          <div class="small">濕度</div>
          <div class="fw-bold">{{ weather.humidity }}%</div>
        </div>
        <div class="col-4 text-center">
          <i class="bi bi-wind text-primary"></i>
          <div class="small">風速</div>
          <div class="fw-bold">{{ weather.windSpeed }} m/s</div>
        </div>
        <div class="col-4 text-center">
          <i class="bi bi-eye text-secondary"></i>
          <div class="small">能見度</div>
          <div class="fw-bold">{{ formatVisibility(weather.visibility) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useFavoritesStore } from '@/stores/favorites'
import { formatDate } from '@/utils/dateUtils'

// Props 定義 (JavaScript 版本)
const props = defineProps({
  weather: {
    type: Object,
    required: true
  }
})

// Stores
const favoritesStore = useFavoritesStore()

// Computed
const isFavorite = computed(() => 
  favoritesStore.isFavorite(props.weather.city)
)

// Methods
const toggleFavorite = () => {
  favoritesStore.toggleFavorite(props.weather)
}

const getWeatherIcon = (iconCode) => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
}

const formatVisibility = (visibility) => {
  return `${(visibility / 1000).toFixed(1)} km`
}
</script>

<style scoped>
.weather-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.weather-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.temperature-display {
  margin-bottom: 10px;
}

.temperature {
  font-size: 3.5rem;
  font-weight: 300;
  color: #2c3e50;
  line-height: 1;
}

.feels-like {
  display: block;
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 5px;
}

.weather-description {
  color: #495057;
  font-weight: 500;
  text-transform: capitalize;
  margin-bottom: 0;
}

.weather-icon {
  width: 100px;
  height: 100px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.bi {
  font-size: 1.2rem;
  margin-bottom: 5px;
}
</style>