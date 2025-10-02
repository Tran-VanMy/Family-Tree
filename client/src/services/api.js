// family-tree/client/src/services/api.js
import axios from 'axios'

const base = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const api = axios.create({
  baseURL: base,
  headers: { 'Content-Type': 'application/json' },
})

export default api
