import { defineStore } from 'pinia'

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