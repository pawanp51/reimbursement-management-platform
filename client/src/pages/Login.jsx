import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Forgot password states
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (forgotMode) {
      // Handle Forgot Password logic
      try {
        setLoading(true);
        const res = await authAPI.forgotPassword(formData.email);
        setForgotMessage('If the email exists, an OTP has been sent. Check your inbox.');
      } catch (err) {
        setError(err.message || 'Failed to send reset link.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Normal Login logic
    try {
      setLoading(true);
      const response = await authAPI.login(formData);
      
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        if (role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/employee-dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      
      <div className="w-full max-w-sm">
        <h1 className="text-center text-gray-900 text-2xl font-semibold mb-8">Signin Page</h1>
        
        <form onSubmit={handleSubmit} className="bg-white border text-gray-800 border-gray-300 rounded-3xl p-8 shadow-sm">
          
          {error && <div className="mb-4 text-red-600 text-sm p-3 bg-red-50 rounded-lg">{error}</div>}
          {forgotMessage && <div className="mb-4 text-green-700 text-sm p-3 bg-green-50 rounded-lg">{forgotMessage}</div>}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all placeholder-gray-400"
              />
            </div>

            {!forgotMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all placeholder-gray-400"
                />
              </div>
            )}
            
            <div className="pt-4 flex justify-center pb-4">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 bg-white border-2 border-gray-800 text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : (forgotMode ? 'Send Reset Link' : 'Login')}
              </button>
            </div>
            
            <div className="text-center space-y-3 pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-gray-900 font-medium border-b border-gray-900 hover:text-gray-600 transition-colors">
                  Signup
                </Link>
              </div>
              
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setForgotMode(!forgotMode);
                    setError('');
                    setForgotMessage('');
                  }}
                  className="text-sm text-red-500 font-medium hover:text-red-400 transition-colors border-b border-red-500 inline-block"
                >
                  {forgotMode ? 'Back to Login' : 'Forgot password?'}
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>

    </div>
  );
}
