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
    if (isLoading) return;
    const { name, email, password, role } = formData;
    
    if (!name.trim() || !email.trim() || !password || !role) {
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
      await register(name.trim(), email.trim(), password, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to register account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-900 flex items-center justify-center p-4 py-10 font-sans">
      <div className="bg-slate-800 p-8 rounded-xl shadow-xl w-full max-w-md border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Create ResQTrace Account</h2>
        <p className="text-sm text-slate-400 mb-6 text-center">Join the emergency coordination network</p>
        
        {error && (
          <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-4 text-sm border border-red-500/20 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
            <input 
              type="text" 
              name="name"
              disabled={isLoading}
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Officer Sarah Jenkins"
              required
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
            <input 
              type="email" 
              name="email"
              disabled={isLoading}
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. s.jenkins@emergency.gov"
              required
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input 
              type="password" 
              name="password"
              disabled={isLoading}
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              required
              minLength="8"
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition disabled:opacity-60"
            />
            <p className="text-xs text-slate-500 mt-1">Must be at least 8 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
            <select 
              name="role"
              disabled={isLoading}
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition disabled:opacity-60"
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value} className="bg-slate-900 text-slate-100">{r.label}</option>
              ))}
            </select>
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="cursor-pointer w-full bg-red-600 hover:bg-red-500 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account? <Link to="/login" className="text-red-400 hover:text-red-300 hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
