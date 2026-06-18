import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import { ROLES } from './utils/constants';

const StudentCourses = React.lazy(() => import('./pages/student/Courses'));
const StudentMyCourses = React.lazy(() => import('./pages/student/MyCourses'));
const StudentProgress = React.lazy(() => import('./pages/student/Progress'));

const CoachSchedule = React.lazy(() => import('./pages/coach/Schedule'));
const CoachStudents = React.lazy(() => import('./pages/coach/Students'));
const CoachCreateCourse = React.lazy(() => import('./pages/coach/CreateCourse'));

const ReceptionStudents = React.lazy(() => import('./pages/reception/Students'));
const ReceptionTrainingHours = React.lazy(() => import('./pages/reception/TrainingHours'));
const ReceptionExams = React.lazy(() => import('./pages/reception/Exams'));
const ReceptionFinances = React.lazy(() => import('./pages/reception/Finances'));

const BossDashboard = React.lazy(() => import('./pages/boss/Dashboard'));
const BossCoachStats = React.lazy(() => import('./pages/boss/CoachStats'));
const BossSubjectStats = React.lazy(() => import('./pages/boss/SubjectStats'));
const BossUsers = React.lazy(() => import('./pages/boss/Users'));

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      setUser(JSON.parse(userStr));
    }
    setLoading(false);
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  if (loading) {
    return <div style={{ padding: 50, textAlign: 'center' }}>加载中...</div>;
  }

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  const getDefaultRoute = (role) => {
    switch (role) {
      case ROLES.STUDENT: return '/student/courses';
      case ROLES.COACH: return '/coach/schedule';
      case ROLES.RECEPTION: return '/reception/students';
      case ROLES.ADMIN: return '/boss/dashboard';
      default: return '/login';
    }
  };

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to={getDefaultRoute(user.role)} replace />} />
      <Route path="/register" element={<Navigate to={getDefaultRoute(user.role)} replace />} />

      <Route path="/*" element={
        <Layout user={user} onLogout={handleLogout}>
          <React.Suspense fallback={<div style={{ padding: 50, textAlign: 'center' }}>加载中...</div>}>
            <Routes>
              <Route path="student/courses" element={
                <ProtectedRoute allowedRoles={[ROLES.STUDENT]}><StudentCourses /></ProtectedRoute>
              } />
              <Route path="student/my-courses" element={
                <ProtectedRoute allowedRoles={[ROLES.STUDENT]}><StudentMyCourses /></ProtectedRoute>
              } />
              <Route path="student/progress" element={
                <ProtectedRoute allowedRoles={[ROLES.STUDENT]}><StudentProgress /></ProtectedRoute>
              } />

              <Route path="coach/schedule" element={
                <ProtectedRoute allowedRoles={[ROLES.COACH, ROLES.ADMIN, ROLES.RECEPTION]}><CoachSchedule /></ProtectedRoute>
              } />
              <Route path="coach/students" element={
                <ProtectedRoute allowedRoles={[ROLES.COACH, ROLES.ADMIN, ROLES.RECEPTION]}><CoachStudents /></ProtectedRoute>
              } />
              <Route path="coach/create-course" element={
                <ProtectedRoute allowedRoles={[ROLES.COACH, ROLES.ADMIN, ROLES.RECEPTION]}><CoachCreateCourse /></ProtectedRoute>
              } />

              <Route path="reception/students" element={
                <ProtectedRoute allowedRoles={[ROLES.RECEPTION, ROLES.ADMIN]}><ReceptionStudents /></ProtectedRoute>
              } />
              <Route path="reception/training-hours" element={
                <ProtectedRoute allowedRoles={[ROLES.RECEPTION, ROLES.ADMIN, ROLES.COACH]}><ReceptionTrainingHours /></ProtectedRoute>
              } />
              <Route path="reception/exams" element={
                <ProtectedRoute allowedRoles={[ROLES.RECEPTION, ROLES.ADMIN]}><ReceptionExams /></ProtectedRoute>
              } />
              <Route path="reception/finances" element={
                <ProtectedRoute allowedRoles={[ROLES.RECEPTION, ROLES.ADMIN]}><ReceptionFinances /></ProtectedRoute>
              } />

              <Route path="boss/dashboard" element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><BossDashboard /></ProtectedRoute>
              } />
              <Route path="boss/coach-stats" element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><BossCoachStats /></ProtectedRoute>
              } />
              <Route path="boss/subject-stats" element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><BossSubjectStats /></ProtectedRoute>
              } />
              <Route path="boss/users" element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><BossUsers /></ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to={getDefaultRoute(user.role)} replace />} />
            </Routes>
          </React.Suspense>
        </Layout>
      } />
    </Routes>
  );
}

export default App;
