<template>
  <div class="forecast-card card h-100">
    <div class="card-body text-center">
      <h6 class="card-title">{{ formatDay(forecast.date) }}</h6>
      <img 
        :src="getWeatherIcon(forecast.icon)" 
        :alt="forecast.description"
        class="forecast-icon mb-2"
      >
      <div class="temperature-range">
        <span class="temp-max">{{ forecast.temperature.max }}°</span>
        <span class="temp-min">{{ forecast.temperature.min }}°</span>
      </div>
      <p class="forecast-description">{{ forecast.description }}</p>
      
      <div class="forecast-details">
        <div class="detail-item">
          <i class="bi bi-droplet text-info"></i>
          <span>{{ forecast.humidity }}%</span>
        </div>
        <div class="detail-item" v-if="forecast.pop > 0">
          <i class="bi bi-umbrella text-primary"></i>
          <span>{{ forecast.pop }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatShortDate, isToday, isTomorrow } from '@/utils/dateUtils'

export default {
  name: 'ForecastCard',
  props: {
    forecast: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatDay(date) {
      if (isToday(date)) return '今天'
      if (isTomorrow(date)) return '明天'
      return formatShortDate(date)
    },
    getWeatherIcon(iconCode) {
      return `https://openweathermap.org/img/wn/${iconCode}.png`
    }
  }
}
</script>

<style scoped>
.forecast-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.forecast-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.forecast-icon {
  width: 50px;
  height: 50px;
}

.temperature-range {
  margin-bottom: 10px;
}

.temp-max {
  font-weight: bold;
  font-size: 1.1rem;
  color: #2c3e50;
}

.temp-min {
  color: #6c757d;
  margin-left: 8px;
}

.forecast-description {
  font-size: 0.85rem;
  color: #495057;
  text-transform: capitalize;
  margin-bottom: 10px;
}

.forecast-details {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  color: #6c757d;
}
</style>