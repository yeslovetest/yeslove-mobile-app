import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const chatbotBaseUrl = (process.env.EXPO_PUBLIC_CHATBOT_BASE_URL || '').trim();
const apiBaseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL || '').trim();
const BASE_URL = (chatbotBaseUrl || apiBaseUrl || 'http://127.0.0.1:8000').replace(/\/+$/, '');

const apiClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add authorization interceptor
apiClient.interceptors.request.use((config) => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface ChatRequest {
    message: string;
    session_id?: string;
    user_id?: number;
    history?: object[];
}

export interface ChatResponse {
    response: string;
    session_id: string;
    user_id: string;
    sources: string;
}

export interface SyncResponse {
    status: string;
}

export interface PostSyncRequest {
    posts: object[];
    action?: string;
}

export interface MigrateRequest {
    documents: object[];
}

export const apiFactory = {
    // Chat API
    sendMessage: (data: ChatRequest, config?: AxiosRequestConfig) =>
        apiClient.post<ChatResponse>('/api/v1/chat/message', data, config),

    // Sync API
    syncBlogs: (data: PostSyncRequest, config?: AxiosRequestConfig) =>
        apiClient.post<SyncResponse>('/api/v1/sync/blogs', data, config),

    // Admin API
    startAutoSync: (config?: AxiosRequestConfig) =>
        apiClient.post<SyncResponse>('/api/v1/admin/sync/start', {}, config),

    stopAutoSync: (config?: AxiosRequestConfig) =>
        apiClient.post<SyncResponse>('/api/v1/admin/sync/stop', {}, config),

    triggerSync: (config?: AxiosRequestConfig) =>
        apiClient.post<SyncResponse>('/api/v1/admin/sync/trigger', {}, config),

    // Migration API
    migrateDocuments: (data: MigrateRequest, config?: AxiosRequestConfig) =>
        apiClient.post('/api/v1/migrate/documents', data, config),

    // Health Check
    healthCheck: (config?: AxiosRequestConfig) =>
        apiClient.get('/api/v1/health', config),
};

export default apiFactory;