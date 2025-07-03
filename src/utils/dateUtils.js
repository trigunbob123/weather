export const formatDate = (date) => {
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
  return new Date(date).toLocaleDateString('zh-TW', options)
}

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatShortDate = (date) => {
  const options = { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  }
  return new Date(date).toLocaleDateString('zh-TW', options)
}

export const isToday = (date) => {
  const today = new Date()
  const targetDate = new Date(date)
  return today.toDateString() === targetDate.toDateString()
}

export const isTomorrow = (date) => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const targetDate = new Date(date)
  return tomorrow.toDateString() === targetDate.toDateString()
}

export const getTimeAgo = (date) => {
  const now = new Date()
  const diffMs = now - new Date(date)
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return '剛剛'
  if (diffMins < 60) return `${diffMins} 分鐘前`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} 小時前`
  
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} 天前`
}