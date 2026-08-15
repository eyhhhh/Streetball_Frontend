import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import MapPage from '@/pages/MapPage';
import Header from '@/components/Header';
import MyPage from '@/pages/MyPage';

function App() {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  // 로그인, 회원가입 페이지에서는 Header 숨기기
  const hideHeader = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideHeader && <Header />}
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
        <Route
          path="/register"
          element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />}
        />
        <Route path="/" element={isAuthenticated ? <MapPage /> : <Navigate to="/login" />} />
        <Route path="/mypage" element={isAuthenticated ? <MyPage /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;
