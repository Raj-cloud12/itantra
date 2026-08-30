import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FieldUserDashboard from './FieldUserDashboard';

export default function MobilePortalPage() {
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || sessionStorage.getItem('field_token');
  const session_id = sessionStorage.getItem('current_session_id');

  const navigate = useNavigate();

  useEffect(() => {
    async function initMobileSession() {
      // If we already have session & token, proceed
      if (session_id && token) {
        setLoading(false);
        return;
      }

      // Otherwise auto-create a session for mobile testing
      try {
        const res = await fetch('/api/session/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field_username: 'MobileOperative_01', command_username: 'CommandCenter' })
        });
        if (res.ok) {
          const data = await res.json();
          sessionStorage.setItem('current_session_id', data.session_id);
          sessionStorage.setItem('field_token', data.field_token);
          sessionStorage.setItem('command_token', data.command_token);
          navigate(`/field/${data.session_id}?token=${data.field_token}`, { replace: true });
        }
      } catch (e) {
        console.error("Auto session create failed", e);
      } finally {
        setLoading(false);
      }
    }

    initMobileSession();
  }, [session_id, token, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mb-4"></div>
          <h2 className="text-lg font-bold text-emerald-400">Connecting Civilian Mobile Node...</h2>
          <p className="text-xs text-slate-400 mt-1">Generating AES-256 Keys & Bluetooth Mesh Handshake</p>
        </div>
      </div>
    );
  }

  return <FieldUserDashboard />;
}
