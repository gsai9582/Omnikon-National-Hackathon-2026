import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LiveIndicator from './LiveIndicator';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMobile = () => setMobileMenuOpen(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-slate-900 text-white shadow-xl border-b border-slate-800 sticky top-0 z-40 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" onClick={closeMobile} className="flex-shrink-0 flex items-center gap-1.5">
              <span className="text-2xl">🚨</span>
              <span className="font-extrabold text-xl tracking-tight text-red-500">ResQ<span className="text-white">Trace</span></span>
            </Link>
            <div className="ml-3 hidden sm:block">
              <LiveIndicator />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-3">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isActive('/dashboard') ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/map" 
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isActive('/map') ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}`}
                >
                  Map
                </Link>
                <Link 
                  to="/cases" 
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isActive('/cases') ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}`}
                >
                  Cases
                </Link>
                <Link 
                  to="/report" 
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isActive('/report') ? 'bg-red-600 text-white' : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/30'}`}
                >
                  Report Case
                </Link>

                {(user.role === 'AUTHORITY' || user.role === 'ADMIN') && (
                  <>
                    <Link 
                      to="/authority/dashboard" 
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isActive('/authority/dashboard') ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50' : 'text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 border border-orange-500/30'}`}
                    >
                      Verify Cases
                    </Link>
                    <Link 
                      to="/authority/tasks" 
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isActive('/authority/tasks') ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50' : 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 border border-blue-500/30'}`}
                    >
                      Manage Tasks
                    </Link>
                  </>
                )}

                {user.role === 'RESPONDER' && (
                  <Link 
                    to="/responder/dashboard" 
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${isActive('/responder/dashboard') ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/30'}`}
                  >
                    My Tasks
                  </Link>
                )}

                <div className="ml-2 flex items-center border-l border-slate-700/80 pl-3 gap-3">
                  <div className="text-right">
                    <span className="text-xs text-white font-medium block leading-none">{user.name}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">{user.role}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="cursor-pointer bg-slate-800 hover:bg-red-600/80 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">
                  Sign In
                </Link>
                <Link to="/register" className="bg-red-600 hover:bg-red-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition shadow-md shadow-red-900/30">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="cursor-pointer p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 pt-3 pb-6 space-y-2">
          <div className="pb-2 mb-2 border-b border-slate-800 flex justify-between items-center">
            <LiveIndicator />
            {user && (
              <div className="text-right">
                <span className="text-xs text-white font-medium block">{user.name}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">{user.role}</span>
              </div>
            )}
          </div>

          {user ? (
            <>
              <Link 
                to="/dashboard" 
                onClick={closeMobile}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                Dashboard
              </Link>
              <Link 
                to="/map" 
                onClick={closeMobile}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                Interactive Map
              </Link>
              <Link 
                to="/cases" 
                onClick={closeMobile}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                Case Directory
              </Link>
              <Link 
                to="/report" 
                onClick={closeMobile}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-amber-400 bg-amber-500/10 border border-amber-500/30"
              >
                Report Missing Person
              </Link>

              {(user.role === 'AUTHORITY' || user.role === 'ADMIN') && (
                <>
                  <Link 
                    to="/authority/dashboard" 
                    onClick={closeMobile}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-orange-400 bg-orange-500/10 border border-orange-500/30"
                  >
                    Verify Cases & AI Matches
                  </Link>
                  <Link 
                    to="/authority/tasks" 
                    onClick={closeMobile}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-blue-400 bg-blue-500/10 border border-blue-500/30"
                  >
                    Coordinate Tasks
                  </Link>
                </>
              )}

              {user.role === 'RESPONDER' && (
                <Link 
                  to="/responder/dashboard" 
                  onClick={closeMobile}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30"
                >
                  My Responder Tasks
                </Link>
              )}

              <div className="pt-4 border-t border-slate-800">
                <button 
                  onClick={handleLogout}
                  className="cursor-pointer w-full bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-lg text-sm font-bold shadow transition"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link 
                to="/login" 
                onClick={closeMobile}
                className="block w-full text-center py-2.5 bg-slate-800 text-slate-200 rounded-lg text-sm font-medium"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                onClick={closeMobile}
                className="block w-full text-center py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold shadow"
              >
                Register Account
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
