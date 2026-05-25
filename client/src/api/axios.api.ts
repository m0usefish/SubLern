import axios from 'axios'
import { getTokenFromLocalStorage } from '../helpers/localstorage.helper'

export const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
})

instance.interceptors.request.use((config) => {
    const token = getTokenFromLocalStorage()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})
