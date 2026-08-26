import axios from 'axios'

// Shared axios instance for all API calls.
// Same-origin by default (local dev, Django serves the SPA); when the SPA
// is deployed separately (Vercel) VITE_API_URL points at the API host.
// Session-cookie based auth with Django's CSRF cookie/header wiring.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
    withCredentials: true,
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
})

export default api
