import axios from 'axios'

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY
const BASE_URL = import.meta.env.VITE_WEATHER_API_BASE_URL

class WeatherAPI {                    // 天氣 API 類別
  constructor() {                     // 初始化
    this.api = axios.create({         // 創建 axios
      baseURL: BASE_URL,              // axios 預設的API主網址
      timeout: 10000,                 // 請求時間
      params: {                       // 查詢參數,下面這些是api的查詢參數
        appid: API_KEY,               // API 金鑰,在.env裡面
        units: 'metric',              // 使用公制單位
        lang: 'zh_tw'                 // 繁體中文
      }
    })

    
    this.api.interceptors.request.use(             // 請求攔截器,發送出去前要做點甚麼事
      (config) => {
        console.log('API Request:', config.url)    // 檢查請求對不對
        return config
      },
      (error) => Promise.reject(error)             // 如果請求錯誤,就丟出錯誤
    )

    
    this.api.interceptors.response.use(            // 回應攔截器,當api回傳資料時,會先經過這裡處理
      (response) => response,                      // 檢查回應對不對
      (error) => {                                 // 如果回應錯誤,就處理錯誤  
        console.error('API Error:', error.response?.data || error.message)     // 檢查錯誤訊息
        return Promise.reject(this.handleError(error))                         // 處理錯誤訊息
      }
    )
  }

  handleError(error) {
    if (error.response) {                                  //假如有錯誤反應
      switch (error.response.status) {                     // 根據狀態碼處理錯誤
        case 404:
          return new Error('找不到該城市，請檢查城市名稱')
        case 401:
          return new Error('API 金鑰無效，請檢查設定')
        case 429:
          return new Error('請求次數過多，請稍後再試')
        default:
          return new Error('天氣服務暫時無法使用')
      }
    } else if (error.request) {                             // 假如有請求但沒有回應
      return new Error('網路連線失敗，請檢查網路狀態')
    } else {
      return new Error('發生未知錯誤')
    }
  }

 
  async getCurrentWeather(cityName) {                       // 根據城市名稱獲取當前天氣
    try {
      const response = await this.api.get('/weather', {     // 發送 GET 請求到 /weather
        params: { q: cityName }                             // 查詢參數,城市名稱
      })
      return this.formatWeatherData(response.data)          // 格式化回應資料
    } catch (error) {                                       // 捕捉錯誤
      throw error                                           // 丟出錯誤
    }
  }

  
  async getCurrentWeatherByCoords(lat, lon) {               // 根據經緯度獲取當前天氣
    try {
      const response = await this.api.get('/weather', {     // 發送 GET 請求到 /weather
        params: { lat, lon }                                // 查詢經緯度,讓API知道想查哪個地點的天氣。
      })
      return this.formatWeatherData(response.data)           // 把api回傳的資料格式化成我們需要的格式
    } catch (error) {                                        // 如果上面回應失敗,就到這裡處理錯誤
      throw error
    }
  }

  
  async getForecast(cityName, days = 5) {                    // 根據城市名稱獲取預報5天
    try {
      const response = await this.api.get('/forecast', {     // 發送 GET 請求到 /forecast
        params: { q: cityName } 
      })
      return this.formatForecastData(response.data, days) 
    } catch (error) {
      throw error
    }
  }


  async getForecastByCoords(lat, lon, days = 5) {            // 根據經緯度獲取預報5天
    try {
      const response = await this.api.get('/forecast', {
        params: { lat, lon }
      })
      return this.formatForecastData(response.data, days)
    } catch (error) {
      throw error
    }
  }

  async searchCities(query) {                                // 根據關鍵字搜尋城市
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct`,     // 使用OpenWeatherMap的地理位置 API
        {
          params: {
            q: query,                                        // 查詢關鍵字
            limit: 5,                                        // 回傳5筆資料
            appid: API_KEY                                   // API 金鑰
          }
        }
      )
      return response.data.map(city => ({                      //回傳的城市陣列(城市名稱,經緯度)
        name: city.name,              
        country: city.country,                                 // 國家代碼
        state: city.state,                                     // 州或省份代碼
        lat: city.lat,                                         // 緯度
        lon: city.lon,                                         // 經度
        displayName: `${city.name}${city.state ? ', ' + city.state : ''}, ${city.country}`   //顯示給使用者看的一段話:東京, JP
      }))
    } catch (error) {
      throw error
    }
  }

  
  formatWeatherData(data) {                              //把複雜的 API 資料，變成前端好讀的格式
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

  
  formatForecastData(data, days) {                  // 接收5天的預報資料
    const dailyForecasts = []                       // 建立一個空陣列，等一下會把整理好的每日預報一筆筆放進來
    const processed = new Set()                     // 用來記錄已經處理過的日期

    for (const item of data.list) {                  // 遍歷每一筆預報資料
      const date = new Date(item.dt * 1000)          // 將時間轉換為日期物件
      const dateStr = date.toDateString()            //把 Date轉成純日期字串，用來比對是不是同一天

      if (!processed.has(dateStr) && dailyForecasts.length < days) {      // 如果這個日期還沒處理過，且每日預報數量還沒達到上限
        processed.add(dateStr)                       // 標記這個日期已經處理過了
        dailyForecasts.push({                        // 將這筆資料整理成我們需要的格式
          date: date,                                
          temperature: {                             // 包含當天的溫度資訊
            min: Math.round(item.main.temp_min),     // 最低溫度
            max: Math.round(item.main.temp_max)
          },
          description: item.weather[0].description,    //天氣描述和對應的圖示代碼。
          icon: item.weather[0].icon,
          humidity: item.main.humidity,
          windSpeed: item.wind.speed,
          pop: Math.round(item.pop * 100) // 降雨機率
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

export default new WeatherAPI()