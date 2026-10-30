import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CollegeProvider, useCollege } from './context/CollegeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import CustomCursor from './components/common/CustomCursor';
import CollegeSelectorModal from './components/common/CollegeSelectorModal';

// Pages
import LandingPage from './pages/LandingPage';
import StudentLogin from './pages/StudentLogin';
import TeacherLogin from './pages/TeacherLogin';
import AdminLogin from './pages/AdminLogin';
import StudentSignup from './pages/StudentSignup';
import TeacherSignup from './pages/TeacherSignup';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

import './App.css';

const CollegeGate = () => {
  const { isSelectorVisible } = useCollege();
  return isSelectorVisible ? <CollegeSelectorModal /> : null;
};

function App() {
  return (
    <AuthProvider>
      <CollegeProvider>
      <div className="app-container">
        <CustomCursor />
        <CollegeGate />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/signup" element={<StudentSignup />} />
          <Route path="/teacher/login" element={<TeacherLogin />} />
          <Route path="/teacher/signup" element={<TeacherSignup />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Teacher Routes */}
          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      </CollegeProvider>
    </AuthProvider>
  );
}

export default App;
