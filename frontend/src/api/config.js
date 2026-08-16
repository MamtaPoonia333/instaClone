export const PROD_API_BASE = 'https://instaclone-57b2.onrender.com'
export const LOCAL_API_BASE = 'http://localhost:3000'

const isRenderHost = window.location.hostname.endsWith('onrender.com')

export const API_BASE = isRenderHost
  ? PROD_API_BASE
  : (import.meta.env.VITE_API_URL || LOCAL_API_BASE)
