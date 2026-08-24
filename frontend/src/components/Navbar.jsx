import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LiveIndicator from './LiveIndicator';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-slate-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl tracking-tight text-red-500">ResQ<span className="text-white">Trace</span></span>
            </Link>
            <div className="ml-4">
              <LiveIndicator />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Dashboard
                </Link>
                <Link to="/map" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Map
                </Link>
                <Link to="/cases" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Cases
                </Link>
                <Link to="/report" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Report
                </Link>
                {(user.role === 'AUTHORITY' || user.role === 'ADMIN') && (
                  <>
                    <Link to="/authority/dashboard" className="text-orange-400 hover:text-orange-300 px-3 py-2 rounded-md text-sm font-medium transition-colors border border-orange-500/30 bg-orange-500/10">
                      Verify Cases
                    </Link>
                    <Link to="/authority/tasks" className="text-blue-400 hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium transition-colors border border-blue-500/30 bg-blue-500/10 ml-2">
                      Manage Tasks
                    </Link>
                  </>
                )}
                {user.role === 'RESPONDER' && (
                  <Link to="/responder/dashboard" className="text-emerald-400 hover:text-emerald-300 px-3 py-2 rounded-md text-sm font-medium transition-colors border border-emerald-500/30 bg-emerald-500/10 ml-2">
                    My Tasks
                  </Link>
                )}
                <div className="ml-4 flex items-center border-l border-slate-700 pl-4">
                  <span className="text-sm text-slate-400 mr-4">Hi, {user.name}</span>
                  <button 
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
