import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const COUNTRIES = [
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'UK', name: 'United Kingdom', currency: 'GBP' },
  { code: 'IN', name: 'India', currency: 'INR' },
  { code: 'EU', name: 'Europe', currency: 'EUR' },
  { code: 'AU', name: 'Australia', currency: 'AUD' }
];

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'US',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setLoading(true);
      // For now, storing currency in localStorage based on country selection
      const selectedCountry = COUNTRIES.find(c => c.code === formData.country);
      if (selectedCountry) {
        localStorage.setItem('company_currency', selectedCountry.currency);
      }

      const response = await authAPI.signup({
        firstName: formData.name, // Mapping 'Name' to 'firstName' for backend
        email: formData.email,
        password: formData.password,
        country: formData.country
      });

      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        const role = response.data.user?.role;
        if (role === 'ADMIN') {
          navigate('/admin');
        } else {
          // If scaling later, route elsewhere
          navigate('/');
        }
      }
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      
      <div className="w-full max-w-sm">
        <h2 className="text-center text-red-500 text-sm font-medium mb-1 border-b border-transparent inline-block w-full">1 admin user per company</h2>
        <h1 className="text-center text-gray-900 text-2xl font-semibold mb-8">Admin (company) Signup Page</h1>
        
        <form onSubmit={handleSubmit} className="bg-white border text-gray-800 border-gray-300 rounded-3xl p-8 shadow-sm">
          
          {error && <div className="mb-4 text-red-600 text-sm p-3 bg-red-50 rounded-lg">{error}</div>}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all placeholder-gray-400"
              />
            </div>
            
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all placeholder-gray-400"
              />
            </div>

            <div className="pt-2 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-1">Country selection</label>
              <div className="relative">
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-gray-700 appearance-none bg-white"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                  ▼
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                The selected country's currency is set in environment as company's base currency.
              </p>
            </div>
            
            <div className="pt-6 flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 bg-white border-2 border-gray-800 text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Signup'}
              </button>
            </div>
            
             <div className="text-center mt-6">
                <span className="text-sm text-gray-500">Already have an account? </span>
                <Link to="/login" className="text-sm border-b border-gray-900 font-medium text-gray-900 hover:text-gray-600 transition-colors">
                  Login
                </Link>
            </div>
          </div>
        </form>
      </div>

    </div>
  );
}
