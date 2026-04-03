import axios from 'axios';

const BASE = 'http://localhost:5000/api';

export const getTodayHabits = () => axios.get(`${BASE}/today`).then(r => r.data);
export const addHabit = (data) => axios.post(`${BASE}/habits`, data).then(r => r.data);
export const deleteHabit = (id) => axios.delete(`${BASE}/habits/${id}`).then(r => r.data);
export const markComplete = (id) => axios.post(`${BASE}/habits/${id}/complete`).then(r => r.data);
export const getAnalytics = () => axios.get(`${BASE}/analytics`).then(r => r.data);
export const getHeatmap = (id) => axios.get(`${BASE}/habits/${id}/heatmap`).then(r => r.data);