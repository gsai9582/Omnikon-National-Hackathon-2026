import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <main className="flex-grow">
        <div className="bg-slate-900 text-white py-20 text-center">
          <h1 className="text-5xl font-bold mb-4">ResQTrace</h1>
          <p className="text-xl text-slate-300 mb-8">Emergency Response Coordination Platform</p>
          <p className="max-w-2xl mx-auto text-slate-400 mb-10 px-4">
            A comprehensive system for tracking missing persons and coordinating emergency response efforts in real-time.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-medium transition-colors">
              Get Started
            </Link>
            <Link to="/login" className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded font-medium transition-colors">
              Sign In
            </Link>
          </div>
        </div>

        <div className="container mx-auto py-16 px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow border border-slate-100">
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Report Missing Persons</h3>
              <p className="text-slate-600">Quickly file detailed reports to mobilize search efforts effectively and accurately.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-slate-100">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Coordinate Response</h3>
              <p className="text-slate-600">Connect authorities, volunteers, and hospitals in one unified platform for faster resolution.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-slate-100">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Real-time Tracking</h3>
              <p className="text-slate-600">Monitor updates, locations, and status changes instantly to make informed decisions.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
