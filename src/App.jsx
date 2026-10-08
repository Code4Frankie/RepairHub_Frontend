import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, useAuth } from './lib/AuthContext.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Home from './pages/Home.jsx';
import Search from './pages/Search.jsx';
import Technician from './pages/Technician.jsx';
import RequestNew from './pages/RequestNew.jsx';
import Requests from './pages/Requests.jsx';
import RequestDetail from './pages/RequestDetail.jsx';
import Booking from './pages/Booking.jsx';
import Jobs from './pages/Jobs.jsx';
import JobDetail from './pages/JobDetail.jsx';
import Payment from './pages/Payment.jsx';
import PaymentCallback from './pages/PaymentCallback.jsx';
import Warranty from './pages/Warranty.jsx';
import Review from './pages/Review.jsx';
import Notifications from './pages/Notifications.jsx';
import Profile from './pages/Profile.jsx';

function RootRedirect() {
  const { isLoggedIn } = useAuth();
  return <Navigate to={isLoggedIn ? '/home' : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
      <Route path="/technician/:id" element={<ProtectedRoute><Technician /></ProtectedRoute>} />

      <Route path="/request-new" element={<ProtectedRoute><RequestNew /></ProtectedRoute>} />
      <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
      <Route path="/request/:id" element={<ProtectedRoute><RequestDetail /></ProtectedRoute>} />

      <Route path="/booking/:quotationId" element={<ProtectedRoute><Booking /></ProtectedRoute>} />

      <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
      <Route path="/job/:id" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />

      <Route path="/payment/callback" element={<ProtectedRoute><PaymentCallback /></ProtectedRoute>} />
      <Route path="/payment/:jobId" element={<ProtectedRoute><Payment /></ProtectedRoute>} />

      <Route path="/warranty/:jobId" element={<ProtectedRoute><Warranty /></ProtectedRoute>} />
      <Route path="/review/:jobId" element={<ProtectedRoute><Review /></ProtectedRoute>} />

      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
