import axios from 'axios';

const api = axios.create({
    baseURL: 'https://gct-backend-production.up.railway.app/api'
});

export default api;