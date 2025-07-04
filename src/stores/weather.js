import { defineStore } from 'pinia'
import weatherAPI from '@/services/weatherApi'

export const useWeatherStore = defineStore('weather', {      // 建立一個Pinia store，名稱叫'weather'
  state: () => ({
    currentWeather: null,          //存放「當前天氣」的資料物件
    forecast: null,                //存放「天氣預報」的資料物件
    loading: false,                //是否正在載入資料
    error: null,                   //用來存放錯誤訊息
    lastUpdated: null              //記錄最後一次資料更新的時間
  }),

  getters: {                        //定義 getters，類似 Vue的computed，用來根據 state 算出衍生資料
    hasWeatherData: (state) => !!state.currentWeather,                 // 是否有當前天氣資料
    isLoading: (state) => state.loading,                               // 是否正在載入資料
    getError: (state) => state.error,                                  // 獲取錯誤訊息
    getCurrentTemp: (state) => state.currentWeather?.temperature,      // 獲取當前溫度
    getCityName: (state) => state.currentWeather?.city                 // 獲取當前城市名稱
  },

  actions: {
    async fetchWeatherByCity(cityName) {
      this.loading = true
      this.error = null

      try {
        const [weather, forecast] = await Promise.all([
          weatherAPI.getCurrentWeather(cityName),
          weatherAPI.getForecast(cityName)
        ])

        this.currentWeather = weather
        this.forecast = forecast
        this.lastUpdated = new Date()
      } catch (error) {
        this.error = error.message
        console.error('Fetch weather error:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchWeatherByCoords(lat, lon) {
      this.loading = true
      this.error = null

      try {
        const [weather, forecast] = await Promise.all([
          weatherAPI.getCurrentWeatherByCoords(lat, lon),
          weatherAPI.getForecastByCoords(lat, lon)
        ])

        this.currentWeather = weather
        this.forecast = forecast
        this.lastUpdated = new Date()
      } catch (error) {
        this.error = error.message
        console.error('Fetch weather by coords error:', error)
      } finally {
        this.loading = false
      }
    },

    async refreshWeather() {
      if (this.currentWeather) {
        await this.fetchWeatherByCity(this.currentWeather.city)
      }
    },

    clearWeather() {
      this.currentWeather = null
      this.forecast = null
      this.error = null
      this.lastUpdated = null
    },

    clearError() {
      this.error = null
    }
  }
})
src/stores/favorites.js
javascriptimport { defineStore } from 'pinia'

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    favoritesCities: []
  }),

  getters: {
    getFavorites: (state) => state.favoritesCities,
    isFavorite: (state) => (cityName) => {
      return state.favoritesCities.some(city => 
        city.name.toLowerCase() === cityName.toLowerCase()
      )
    },
    favoritesCount: (state) => state.favoritesCities.length
  },

  actions: {
    addFavorite(cityData) {
      const exists = this.favoritesCities.some(city => 
        city.name.toLowerCase() === cityData.name.toLowerCase()
      )
      
      if (!exists) {
        const favorite = {
          id: Date.now(),
          name: cityData.name || cityData.city,
          country: cityData.country,
          coords: cityData.coords,
          addedAt: new Date()
        }
        
        this.favoritesCities.unshift(favorite)
        this.saveFavorites()
      }
    },

    removeFavorite(cityName) {
      this.favoritesCities = this.favoritesCities.filter(city => 
        city.name.toLowerCase() !== cityName.toLowerCase()
      )
      this.saveFavorites()
    },

    toggleFavorite(cityData) {
      if (this.isFavorite(cityData.name || cityData.city)) {
        this.removeFavorite(cityData.name || cityData.city)
      } else {
        this.addFavorite(cityData)
      }
    },

    reorderFavorites(newOrder) {
      this.favoritesCities = newOrder
      this.saveFavorites()
    },

    loadFavorites() {
      const saved = localStorage.getItem('weather-app-favorites')
      if (saved) {
        this.favoritesCities = JSON.parse(saved)
      }
    },

    saveFavorites() {
      localStorage.setItem('weather-app-favorites', JSON.stringify(this.favoritesCities))
    },

    clearFavorites() {
      this.favoritesCities = []
      this.saveFavorites()
    }
  }
})