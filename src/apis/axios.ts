import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // 로그인, 회원가입 요청에는 토큰을 추가하지 않음
    const isAuthEndpoint =
      config.url?.includes('/users/login') || config.url?.includes('/users/signup');

    if (!isAuthEndpoint) {
      const token = localStorage.getItem('auth-storage');
      if (token) {
        const authData = JSON.parse(token);
        if (authData.state?.token) {
          config.headers.Authorization = `Bearer ${authData.state.token}`;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    // 200번대 상태 코드만 통과
    if (response.status >= 200 && response.status < 300) {
      return response;
    }
    // 200번대가 아니면 에러로 처리
    return Promise.reject(new Error(`Unexpected status code: ${response.status}`));
  },
  (error) => {
    const status = error.response?.status;

    // 401: 인증 실패 (토큰 만료 또는 유효하지 않은 토큰)
    if (status === 401) {
      // 현재 경로가 /login이나 /register가 아닐 때만 리다이렉트
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        // 로컬 스토리지 정리
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // 사용자에게 알림
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        
        // 로그인 페이지로 리다이렉트
        window.location.href = '/login';
      }
    }

    // 403: 권한 없음
    if (status === 403) {
      console.error('접근 권한이 없습니다.');
    }

    // 404: 리소스 없음
    if (status === 404) {
      console.error('요청한 리소스를 찾을 수 없습니다.');
    }

    // 500번대: 서버 에러
    if (status >= 500) {
      console.error('서버 오류가 발생했습니다.');
    }

    return Promise.reject(error);
  },
);

export default api;
