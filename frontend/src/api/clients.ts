import axios from 'axios'
import { AppControllerClient } from './api'

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL

export const appClient = new AppControllerClient(undefined, axios)
