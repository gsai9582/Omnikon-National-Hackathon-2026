import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('[ResQTrace Error Boundary Caught Error]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleClearCacheAndReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Could not clear storage:', e);
    }
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-xl w-full bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 bg-red-500/20 text-red-400 border border-red-500/40 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-inner">
              🛡️
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              ResQTrace Application Guard
            </h1>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              An unexpected runtime error occurred. Your active incident data in IndexedDB remains safe. You can reload the page or return to the safe dashboard view.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <button
                onClick={this.handleReload}
                className="cursor-pointer bg-red-600 hover:bg-red-500 text-white font-medium py-2.5 px-6 rounded-lg shadow-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>🔄</span> Reload Application
              </button>
              <button
                onClick={this.handleGoHome}
                className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium py-2.5 px-6 rounded-lg transition-colors"
              >
                Return to Safe Home
              </button>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-center">
              <button
                onClick={this.handleClearCacheAndReset}
                className="cursor-pointer text-xs text-slate-500 hover:text-slate-400 underline transition-colors"
              >
                Clear Stale Session Data & Sign In Again
              </button>
            </div>

            {this.state.error && (
              <details className="mt-6 text-left bg-slate-950 p-4 rounded-lg border border-slate-800/80 text-xs font-mono text-slate-400 overflow-x-auto">
                <summary className="cursor-pointer font-sans font-semibold text-slate-400 hover:text-slate-200 mb-2 select-none">
                  Technical Diagnostics (for Panel & Devs)
                </summary>
                <div className="text-red-400 font-bold mb-2">
                  {this.state.error.toString()}
                </div>
                <div className="text-slate-500 whitespace-pre-wrap">
                  {this.state.errorInfo?.componentStack || 'No component stack available.'}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
