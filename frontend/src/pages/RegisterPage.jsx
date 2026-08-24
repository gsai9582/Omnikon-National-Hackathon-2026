import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CITIZEN'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { value: 'CITIZEN', label: 'Citizen' },
    { value: 'HOSPITAL', label: 'Hospital Staff' },
    { value: 'CAMP', label: 'Camp Coordinator' },
    { value: 'RESPONDER', label: 'Responder' },
    { value: 'AUTHORITY', label: 'Authority' },
    { value: 'ADMIN', label: 'Administrator' }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, role } = formData;
    
    if (!name || !email || !password || !role) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await register(name, email, password, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 py-10 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Create Account</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="8"
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">Must be at least 8 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select 
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none bg-white"
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="cursor-pointer w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded transition-colors disabled:opacity-70 mt-4"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account? <Link to="/login" className="text-red-600 hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
