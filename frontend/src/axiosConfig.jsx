import axios from 'axios';

const isProduction = process.env.NODE_ENV === 'production';

const axiosInstance = axios.create({
  baseURL: isProduction ? '' : 'http://localhost:5001',
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;