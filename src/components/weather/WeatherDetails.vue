<template>
  <div class="weather-details card">
    <div class="card-header">
      <h5 class="mb-0">
        <i class="bi bi-info-circle me-2"></i>詳細資訊
      </h5>
    </div>
    <div class="card-body">
      <div class="row g-3">
        <div class="col-md-4 col-6">
          <div class="detail-item">
            <i class="bi bi-thermometer-half text-danger"></i>
            <div>
              <div class="detail-label">氣壓</div>
              <div class="detail-value">{{ weather.pressure }} hPa</div>
            </div>
          </div>
        </div>
        <div class="col-md-4 col-6">
          <div class="detail-item">
            <i class="bi bi-cloud text-info"></i>
            <div>
              <div class="detail-label">雲量</div>
              <div class="detail-value">{{ weather.cloudiness }}%</div>
            </div>
          </div>
        </div>
        <div class="col-md-4 col-6">
          <div class="detail-item">
            <i class="bi bi-compass text-primary"></i>
            <div>
              <div class="detail-label">風向</div>
              <div class="detail-value">{{ getWindDirection(weather.windDirection) }}</div>
            </div>
          </div>
        </div>
        <div class="col-md-4 col-6">
          <div class="detail-item">
            <i class="bi bi-sunrise text-warning"></i>
            <div>
              <div class="detail-label">日出</div>
              <div class="detail-value">{{ formatTime(weather.sunrise) }}</div>
            </div>
          </div>
        </div>
        <div class="col-md-4 col-6">
          <div class="detail-item">
            <i class="bi bi-sunset text-orange"></i>
            <div>
              <div class="detail-label">日落</div>
              <div class="detail-value">{{ formatTime(weather.sunset) }}</div>
            </div>
          </div>
        </div>
        <div class="col-md-4 col-6">
          <div class="detail-item">
            <i class="bi bi-clock text-secondary"></i>
            <div>
              <div class="detail-label">更新時間</div>
              <div class="detail-value">{{ getTimeAgo(weather.updatedAt) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatTime, getTimeAgo } from '@/utils/dateUtils'

// Props 定義 (JavaScript 版本)
const props = defineProps({
  weather: {
    type: Object,
    required: true
  }
})

// Methods
const getWindDirection = (degrees) => {
  const directions = [
    '北', '北北東', '東北', '東北東', '東', '東南東', 
    '東南', '南南東', '南', '南南西', '西南', '西南西', 
    '西', '西北西', '西北', '北北西'
  ]
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}
</script>

<style scoped>
.weather-details {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(248, 249, 250, 0.6);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.detail-item:hover {
  background: rgba(248, 249, 250, 0.9);
  transform: translateY(-1px);
}

.detail-item i {
  font-size: 1.5rem;
  width: 30px;
  text-align: center;
}

.detail-label {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 2px;
}

.detail-value {
  font-weight: 600;
  color: #2c3e50;
}

.text-orange {
  color: #fd7e14 !important;
}
</style>