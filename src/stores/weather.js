import { defineStore } from 'pinia'
import weatherAPI from '@/services/weatherApi'

export const useWeatherStore = defineStore('weather', {
  state: () => ({
    currentWeather: null,
    forecast: null,
    loading: false,
    error: null,
    lastUpdated: null
  }),

  getters: {
    hasWeatherData: (state) => !!state.currentWeather,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    getCurrentTemp: (state) => state.currentWeather?.temperature,
    getCityName: (state) => state.currentWeather?.city
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