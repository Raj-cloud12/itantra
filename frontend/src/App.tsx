import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CommandCenterDashboard from './pages/CommandCenterDashboard';
import FieldUserDashboard from './pages/FieldUserDashboard';
import DemoMode from './pages/DemoMode';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Routes>
        {/* Directly open Command Center at Root http://localhost:5173 */}
        <Route path="/" element={<CommandCenterDashboard />} />
        <Route path="/command" element={<CommandCenterDashboard />} />
        <Route path="/command/:sessionId" element={<CommandCenterDashboard />} />
        <Route path="/command-center" element={<CommandCenterDashboard />} />
        
        {/* Field Mobile Dashboard */}
        <Route path="/field" element={<FieldUserDashboard />} />
        <Route path="/field/:sessionId" element={<FieldUserDashboard />} />
        <Route path="/mobile" element={<FieldUserDashboard />} />
        
        {/* Helper & Demo Views */}
        <Route path="/demo" element={<DemoMode />} />
        <Route path="/demo/:sessionId" element={<DemoMode />} />
      </Routes>
    </div>
  );
}
