import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import DemoMode from './DemoMode';

export default function DemoPortalPage() {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function initDemoSession() {
      const GLOBAL_SESSION = sessionId || sessionStorage.getItem('current_session_id') || 'DEMO_GLOBAL_SESSION_01';
      sessionStorage.setItem('current_session_id', GLOBAL_SESSION);

      const existingToken = searchParams.get('token') || sessionStorage.getItem('field_token');
      if (existingToken) {
        sessionStorage.setItem('field_token', existingToken);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/session/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field_username: 'DemoUser', command_username: 'CommandCenter' })
        });
        if (res.ok) {
          const data = await res.json();
          sessionStorage.setItem('field_token', data.field_token);
          sessionStorage.setItem('command_token', data.command_token);
        }
      } catch (e) {
        console.error("Auto session create failed for demo", e);
      } finally {
        setLoading(false);
      }
    }

    initDemoSession();
  }, [sessionId, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mb-4"></div>
          <h2 className="text-lg font-bold text-emerald-400">Launching Jury Demo Mode...</h2>
          <p className="text-xs text-slate-400 mt-1">Initializing AI Compression & Bandwidth Simulator Gateway</p>
        </div>
      </div>
    );
  }

  return <DemoMode />;
}
