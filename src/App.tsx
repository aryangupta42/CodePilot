import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { IdePage } from './pages/IdePage';
import { QuickCodingPage } from './pages/QuickCodingPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/ide/:projectId" element={<IdePage />} />
        <Route path="/coding" element={<QuickCodingPage />} />
        <Route path="/start-coding" element={<QuickCodingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
