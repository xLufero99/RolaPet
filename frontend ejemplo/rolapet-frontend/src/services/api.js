import axios from 'axios';

const AUTH_API = 'http://localhost:8081/api/v1';
const USER_API = 'http://localhost:8082';

export const authService = {
  register: (userData) => axios.post(`${AUTH_API}/auth/register`, userData),
  login: (credentials) => axios.post(`${AUTH_API}/auth/login`, credentials)
};