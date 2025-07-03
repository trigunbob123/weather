import { defineStore } from 'pinia'

export const useHistoryStore = defineStore('history', {
  state: () => ({
    searchHistory: []
  }),

  getters: {
    getHistory: (state) => state.searchHistory,
    recentSearches: (state) => state.searchHistory.slice(0, 10)
  },

  actions: {
    addToHistory(cityName) {
      // 移除重複項目
      this.searchHistory = this.searchHistory.filter(item => 
        item.name.toLowerCase() !== cityName.toLowerCase()
      )
      
      // 添加到開頭
      this.searchHistory.unshift({
        id: Date.now(),
        name: cityName,
        searchedAt: new Date()
      })
      
      // 限制歷史記錄數量
      if (this.searchHistory.length > 20) {
        this.searchHistory = this.searchHistory.slice(0, 20)
      }
      
      this.saveHistory()
    },

    removeFromHistory(cityName) {
      this.searchHistory = this.searchHistory.filter(item => 
        item.name.toLowerCase() !== cityName.toLowerCase()
      )
      this.saveHistory()
    },

    clearHistory() {
      this.searchHistory = []
      this.saveHistory()
    },

    loadHistory() {
      const saved = localStorage.getItem('weather-app-history')
      if (saved) {
        this.searchHistory = JSON.parse(saved)
      }
    },

    saveHistory() {
      localStorage.setItem('weather-app-history', JSON.stringify(this.searchHistory))
    }
  }
})