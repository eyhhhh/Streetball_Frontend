import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/apis/authApi';
import { LoginCredentials } from '@/types';
import { AxiosError } from 'axios';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState({
    latitude: 0,
    longitude: 0,
  });

  const [formData, setFormData] = useState<LoginCredentials>({
    name: '',
    password: '',
    locationLat: 0,
    locationLng: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login({
        ...formData,
        locationLat: location.latitude,
        locationLng: location.longitude,
      });

      // 토큰을 localStorage에 저장
      localStorage.setItem('token', response.token);

      // 사용자 정보도 저장 (필요한 경우)
      localStorage.setItem(
        'user',
        JSON.stringify({
          userId: response.userId,
          name: response.name,
          hasBall: response.hasBall,
          locationLat: response.locationLat,
          locationLng: response.locationLng,
        }),
      );

      navigate('/');
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || '로그인에 실패했습니다.');
      } else {
        setError('로그인에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🏀 Streetball</h1>
          <p className="text-primary-100">농구 게임 매칭 플랫폼</p>
        </div>

        {/* Login Form */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">로그인</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">이메일</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="your nickname"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">비밀번호</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:bg-gray-400"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              만들어둔 계정이 없으신가요?{' '}
              <Link to="/register" className="text-orange-600 hover:text-orange-700 font-semibold">
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
