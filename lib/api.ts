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
  completeBlock: (blockIndex: number, timeSpent?: number) => 
    api.patch(`/schedule/block/${blockIndex}/complete`, { timeSpent }),
  incompleteBlock: (blockIndex: number) => 
    api.patch(`/schedule/block/${blockIndex}/incomplete`),
  timerAction: (blockIndex: number, action: 'start' | 'stop') => 
    api.patch(`/schedule/block/${blockIndex}/timer`, { action }),
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

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  
  // Questions
  getQuestions: (params?: any) => api.get('/admin/questions', { params }),
  addQuestion: (data: any) => api.post('/admin/questions', data),
  addBulkQuestions: (questions: any[]) => api.post('/admin/questions/bulk', { questions }),
  updateQuestion: (id: string, data: any) => api.put(`/admin/questions/${id}`, data),
  deleteQuestion: (id: string) => api.delete(`/admin/questions/${id}`),
  
  // Series
  getSeries: (params?: any) => api.get('/admin/series', { params }),
  addSeries: (data: any) => api.post('/admin/series', data),
  updateSeries: (id: string, data: any) => api.put(`/admin/series/${id}`, data),
  deleteSeries: (id: string) => api.delete(`/admin/series/${id}`),
  
  // Tests
  getTests: (params?: any) => api.get('/admin/tests', { params }),
  updateTest: (id: string, data: any) => api.put(`/admin/tests/${id}`, data),
  updateAnswerKey: (id: string, answerKey: Record<string, string>) => api.put(`/admin/tests/${id}/answer-key`, { answerKey }),
  createTestFromQuestions: (data: any) => api.post('/admin/create-test-from-questions', data),
  
  // Users
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  updateUserRole: (id: string, role: string) => api.put(`/admin/users/${id}/role`, { role }),
  
  // Subjects
  getSubjects: () => api.get('/admin/subjects'),
};

export const youtubeCourseAPI = {
  getCourses: () => api.get('/youtube-courses'),
  addCourse: (data: { url: string; subject?: string }) => api.post('/youtube-courses/add', data),
  getCourse: (id: string) => api.get(`/youtube-courses/${id}`),
  deleteCourse: (id: string) => api.delete(`/youtube-courses/${id}`),
  markVideoComplete: (courseId: string, videoId: string) => 
    api.patch(`/youtube-courses/${courseId}/video/${videoId}/complete`),
  markVideoIncomplete: (courseId: string, videoId: string) => 
    api.patch(`/youtube-courses/${courseId}/video/${videoId}/incomplete`),
  updateWatched: (courseId: string, videoId: string) => 
    api.patch(`/youtube-courses/${courseId}/watched/${videoId}`),
};

