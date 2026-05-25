import axios from 'axios'
import { getTokenFromLocalStorage } from '../helpers/localstorage.helper'

export const instance = axios.create({
    baseURL: 'http://localhost:3001/api',
})

instance.interceptors.request.use((config) => {
    const token = getTokenFromLocalStorage()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})
