import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.post('/api/auth/login', formData);
      login(response.data);
      navigate('/admin');
    } catch (error) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-amber-400 mb-6">Admin Login</h1>
        <div className="border-t-2 border-amber-500 mb-4" />
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 shadow-sm rounded-lg border border-amber-800">
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-300 p-3 rounded mb-4 text-sm">{error}</div>
          )}
          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input
            type="email"
            placeholder="admin@restaurant.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full mb-4 p-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
            required
          />
          <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full mb-4 p-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 text-white p-2 rounded hover:bg-amber-600 transition font-semibold disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="border-b-2 border-amber-500 mt-4" />
      </div>
    </div>
  );
};

export default Login;