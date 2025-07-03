import { defineStore } from 'pinia'

export const useLocationStore = defineStore('location', {
  state: () => ({
    userLocation: null,
    locationError: null,
    isGettingLocation: false,
    locationPermission: null
  }),

  getters: {
    hasLocation: (state) => !!state.userLocation,
    isLocationLoading: (state) => state.isGettingLocation
  },

  actions: {
    async getCurrentLocation() {
      if (!navigator.geolocation) {
        this.locationError = '您的瀏覽器不支援地理定位功能'
        return false
      }

      this.isGettingLocation = true
      this.locationError = null

      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000 // 5分鐘
            }
          )
        })

        this.userLocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date()
        }

        this.locationPermission = 'granted'
        return true
      } catch (error) {
        this.handleLocationError(error)
        return false
      } finally {
        this.isGettingLocation = false
      }
    },

    handleLocationError(error) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          this.locationError = '您拒絕了地理定位權限請求'
          this.locationPermission = 'denied'
          break
        case error.POSITION_UNAVAILABLE:
          this.locationError = '無法獲取您的位置資訊'
          break
        case error.TIMEOUT:
          this.locationError = '定位請求超時，請重試'
          break
        default:
          this.locationError = '獲取位置時發生錯誤'
          break
      }
    },

    clearLocation() {
      this.userLocation = null
      this.locationError = null
    }
  }
})