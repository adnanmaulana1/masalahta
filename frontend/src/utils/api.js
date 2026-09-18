import axios from 'axios'

const apiURL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8080/api`

const api = axios.create({
  baseURL: apiURL,
})

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export default api
