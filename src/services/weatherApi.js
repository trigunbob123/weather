import axios from 'axios'

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY
const BASE_URL = import.meta.env.VITE_WEATHER_API_BASE_URL

class WeatherAPI {
  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      params: {
        appid: API_KEY,
        units: 'metric',
        lang: 'zh_tw'
      }
    })

    this.api.interceptors.request.use(
      (config) => {
        console.log('API Request:', config.url)
        return config
      },
      (error) => Promise.reject(error)
    )

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message)
        return Promise.reject(this.handleError(error))
      }
    )
  }

  handleError(error) {
    if (error.response) {
      switch (error.response.status) {
        case 404:
          return new Error('找不到該城市，請檢查城市名稱')
        case 401:
          return new Error('API 金鑰無效，請檢查設定')
        case 429:
          return new Error('請求次數過多，請稍後再試')
        default:
          return new Error('天氣服務暫時無法使用')
      }
    } else if (error.request) {
      return new Error('網路連線失敗，請檢查網路狀態')
    } else {
      return new Error('發生未知錯誤')
    }
  }

  async getCurrentWeather(cityName) {
    try {
      let queryCity = cityName
      if (cityName === '台北' || cityName === 'Taipei') {
        queryCity = 'Taipei,TW'
      } else if (cityName === '高雄' || cityName === 'Kaohsiung') {
        queryCity = 'Kaohsiung,TW'
      }

      const response = await this.api.get('/weather', {
        params: { q: queryCity }
      })
      return this.formatWeatherData(response.data)
    } catch (error) {
      throw error
    }
  }

  async getCurrentWeatherByCoords(lat, lon) {
    try {
      const response = await this.api.get('/weather', {
        params: { lat, lon }
      })
      return this.formatWeatherData(response.data)
    } catch (error) {
      throw error
    }
  }

  async getForecast(cityName, days = 5) {
    try {
      let queryCity = cityName
      if (cityName === '台北' || cityName === 'Taipei') {
        queryCity = 'Taipei,TW'
      } else if (cityName === '高雄' || cityName === 'Kaohsiung') {
        queryCity = 'Kaohsiung,TW'
      }

      const response = await this.api.get('/forecast', {
        params: { q: queryCity }
      })
      return this.formatForecastData(response.data, days)
    } catch (error) {
      throw error
    }
  }

  async getForecastByCoords(lat, lon, days = 5) {
    try {
      const response = await this.api.get('/forecast', {
        params: { lat, lon }
      })
      return this.formatForecastData(response.data, days)
    } catch (error) {
      throw error
    }
  }

  async searchCities(query) {
    try {
      const response = await axios.get(
        'https://api.openweathermap.org/geo/1.0/direct',
        {
          params: {
            q: query,
            limit: 5,
            appid: API_KEY
          }
        }
      )
      return response.data.map(city => ({
        name: city.name,
        country: city.country,
        state: city.state,
        lat: city.lat,
        lon: city.lon,
        displayName: `${city.name}${city.state ? ', ' + city.state : ''}, ${city.country}`
      }))
    } catch (error) {
      throw error
    }
  }

  formatWeatherData(data) {
    return {
      id: data.id,
      city: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      visibility: data.visibility,
      cloudiness: data.clouds.all,
      sunrise: new Date(data.sys.sunrise * 1000),
      sunset: new Date(data.sys.sunset * 1000),
      timezone: data.timezone,
      coords: {
        lat: data.coord.lat,
        lon: data.coord.lon
      },
      updatedAt: new Date()
    }
  }

  formatForecastData(data, days) {
    const dailyForecasts = []
    const processed = new Set()

    for (const item of data.list) {
      const date = new Date(item.dt * 1000)
      const dateStr = date.toDateString()

      if (!processed.has(dateStr) && dailyForecasts.length < days) {
        processed.add(dateStr)
        dailyForecasts.push({
          date: date,
          temperature: {
            min: Math.round(item.main.temp_min),
            max: Math.round(item.main.temp_max)
          },
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          humidity: item.main.humidity,
          windSpeed: item.wind.speed,
          pop: Math.round(item.pop * 100)
        })
      }
    }

    return {
      city: data.city.name,
      country: data.city.country,
      forecasts: dailyForecasts
    }
  }
}

// ✅ class 結束後 export
export default new WeatherAPI()