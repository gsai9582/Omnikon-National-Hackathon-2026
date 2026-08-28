import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-slate-900 text-slate-100 font-sans">
      <div className="max-w-md w-full text-center bg-slate-800/80 border border-slate-700/80 p-8 rounded-2xl shadow-xl">
        <div className="text-6xl mb-4 font-mono font-extrabold text-amber-500">
          404
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-slate-400 text-sm mb-8">
          The route you are trying to access does not exist or may have been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="cursor-pointer px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors"
          >
            ← Go Back
          </button>
          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors inline-block"
          >
            {isAuthenticated ? "Go to Dashboard" : "Go to Home"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
