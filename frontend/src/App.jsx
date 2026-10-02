import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Guardians from './pages/Guardians';
import Attendance from './pages/Attendance';
import Timetable from './pages/Timetable';
import Fees from './pages/Fees';
import Exams from './pages/Exams';
import Notices from './pages/Notices';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import MyProfile from './pages/MyProfile';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="students" element={<ProtectedRoute roles={['admin','teacher','staff']}><Students /></ProtectedRoute>} />
        <Route path="teachers" element={<ProtectedRoute roles={['admin','staff']}><Teachers /></ProtectedRoute>} />
        <Route path="guardians" element={<ProtectedRoute roles={['admin','staff']}><Guardians /></ProtectedRoute>} />
        <Route path="attendance" element={<ProtectedRoute roles={['admin','teacher']}><Attendance /></ProtectedRoute>} />
        <Route path="timetable" element={<Timetable />} />
        <Route path="fees" element={<ProtectedRoute roles={['admin','accounts']}><Fees /></ProtectedRoute>} />
        <Route path="exams" element={<Exams />} />
        <Route path="notices" element={<Notices />} />
        <Route path="progress" element={<Progress />} />
        <Route path="settings" element={<ProtectedRoute roles={['admin']}><Settings /></ProtectedRoute>} />
        <Route path="profile" element={<MyProfile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
