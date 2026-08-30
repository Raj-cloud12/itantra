import React from 'react';
import { Routes, Route } from 'react-router-dom';
import FieldUserDashboard from './pages/FieldUserDashboard';
import EmergencyFeedPage from './pages/EmergencyFeedPage';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: string }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error: String(error) };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("UI Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-red-950 border-2 border-red-600 flex items-center justify-center text-3xl shadow-xl animate-pulse">
            🚨
          </div>
          <h1 className="text-base font-black text-rose-300">iTiTantra Recovery Mode</h1>
          <p className="text-xs text-slate-400 max-w-xs">{this.state.error}</p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: '' });
              window.location.reload();
            }}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg active:scale-95 transition-all"
          >
            🔄 Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        <Routes>
          <Route path="/" element={<FieldUserDashboard />} />
          <Route path="/field/:sessionId" element={<FieldUserDashboard />} />
          <Route path="/feed/:sessionId" element={<EmergencyFeedPage />} />
          <Route path="*" element={<FieldUserDashboard />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}
