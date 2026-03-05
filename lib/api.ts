import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

console.log('API Configuration:', { API_BASE });

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  console.log('API Request:', {
    method: config.method,
    url: config.url,
    baseURL: config.baseURL,
    data: config.data
  });
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('upsc_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    console.log('API Response:', { status: res.status, data: res.data });
    return res;
  },
  (err) => {
    const errorDetails = {
      code: err?.code,
      status: err?.response?.status,
      statusText: err?.response?.statusText,
      data: err?.response?.data,
      message: err?.message,
      method: err?.config?.method,
      url: err?.config?.url,
      baseURL: err?.config?.baseURL,
    };

    if (!err?.response) {
      err.message = `Cannot connect to backend at ${API_BASE}. Make sure backend is running and CORS allows frontend.`;
    }
    console.warn('API Error Response:', errorDetails);

    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('upsc_token');
      localStorage.removeItem('upsc_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
export const authAPI = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: { name: string; email: string; password: string; state: string }) => api.post('/auth/register', data),
};
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: any) => api.patch('/user/profile', data),
  getStats: () => api.get('/user/stats'),
};
export const libraryAPI = {
  getSources: () => api.get('/library'),
  addSource: (data: any) => api.post('/library', data),
  updateChapter: (sourceId: string, chapterIndex: number, data: any) => api.patch(`/library/${sourceId}/chapter/${chapterIndex}`, data),
  deleteSource: (id: string) => api.delete(`/library/${id}`),
};
export const missionsAPI = {
  getMissions: () => api.get('/missions'),
  createMission: (data: any) => api.post('/missions', data),
  updateProgress: (id: string, data: any) => api.patch(`/missions/${id}/progress`, data),
  rebalance: (id: string) => api.post(`/missions/${id}/rebalance`),
  deleteMission: (id: string) => api.delete(`/missions/${id}`),
  toggleTask: (id: string, date: string) => api.patch(`/missions/${id}/toggle-task`, { date }),
};
export const trackerAPI = {
  getEntries: (days?: number) => api.get(`/tracker${days ? `?days=${days}` : ''}`),
  submitDaily: (data: any) => api.post('/tracker', data),
};
export const scheduleAPI = {
  getToday: () => api.get('/schedule/today'),
  getDate: (date: string) => api.get(`/schedule/date/${date}`),
  generate: (date?: string) => api.post('/schedule/generate', { date }),
  refine: (instruction: string, date?: string) => api.post('/schedule/refine', { instruction, date }),
};
export const mentorAPI = {
  chat: (data: { message: string; conversationHistory: any[] }) => api.post('/mentor/chat', data),
  weeklyReport: () => api.get('/mentor/weekly-report'),
};
export const testsAPI = {
  getSeries: () => api.get('/tests'),
  getSeriesWithAttempts: () => api.get('/tests/series-with-attempts'),
  addSeries: (data: any) => api.post('/tests', data),
  addAttempt: (id: string, data: any) => api.post(`/tests/${id}/attempt`, data),
  deleteSeries: (id: string) => api.delete(`/tests/${id}`), // Naya method

};
export const mockTestAPI = {
  getAll: (params?: any) => api.get('/mock-tests', { params }),
  getOne: (id: string) => api.get(`/mock-tests/${id}`),
  upload: (formData: FormData) =>
    api.post('/mock-tests/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadStructured: (data: any) => api.post('/mock-tests/upload-structured', data),
  getFilters: () => api.get('/mock-tests/metadata/filters'),
  pollStatus: (id: string) => api.get(`/mock-tests/${id}`),
  submitAttempt: (
    id: string,
    data: { userAnswers: Record<string, string | null>; timeTakenMinutes: number }
  ) => api.post(`/mock-tests/${id}/submit`, data),
  getAttempt: (attemptId: string) => api.get(`/mock-tests/attempts/${attemptId}`),
  getAllAttempts: (params?: { limit?: number }) => api.get('/mock-tests/attempts/all/list', { params }),
  deleteTest: (id: string) => api.delete(`/mock-tests/${id}`),
  updateAnswerKey: (id: string, answerKey: Map<string, string>) =>
    api.put(`/mock-tests/${id}/answer-key`, Object.fromEntries(answerKey)),
};
export const ddayAPI = {
  getAll: () => api.get('/d-day'),
  getCurrent: () => api.get('/d-day/current'),
  setTarget: (data: { targetName: string; targetDate: string }) => api.post('/d-day', data),
  deleteTarget: (id: string) => api.delete(`/d-day/${id}`),
  clearCurrent: () => api.delete('/d-day/current'),
};

