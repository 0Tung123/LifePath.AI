import axios from 'axios';

// API URL từ biến môi trường hoặc giá trị mặc định
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Tạo instance axios với cấu hình mặc định
export const backendApi = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 giây
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để xử lý token
backendApi.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // Thêm token vào header nếu có
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý lỗi
backendApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý lỗi 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Xóa token và chuyển hướng đến trang đăng nhập
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);