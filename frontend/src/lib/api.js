import axios from 'axios'

// Shared axios instance for all API calls.
// Same-origin (Django serves the SPA), session-cookie based auth,
// with Django's CSRF cookie/header wiring.
const api = axios.create({
    baseURL: '',
    withCredentials: true,
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
})

export default api
