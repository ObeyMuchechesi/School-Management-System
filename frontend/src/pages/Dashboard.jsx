import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = {
      admin: '/dashboard/admin',
      teacher: '/dashboard/teacher',
      student: '/dashboard/student',
      guardian: '/dashboard/guardian',
      staff: '/dashboard/admin',
      accounts: '/dashboard/admin',
    }[user.role];
    api.get(endpoint)
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.role]);

  if (loading) return <div>Loading dashboard...</div>;
  if (!data) return <div>No data</div>;

  return (
    <div className="space-y-6">
      {/* Admin */}
      {user.role === 'admin' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Students" value={data.counts.students} icon="🎓" color="primary" />
            <StatCard title="Total Teachers" value={data.counts.teachers} icon="👨‍🏫" color="purple" />
            <StatCard title="Guardians" value={data.counts.guardians} icon="👪" color="green" />
            <StatCard title="Collected" value={`$${data.finances.totalCollected.toLocaleString()}`} icon="💰" color="yellow"
              subtitle={`Outstanding: $${data.finances.outstanding.toLocaleString()}`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold mb-4">Today's Attendance</h3>
              <div className="flex gap-4">
                <div className="flex-1 bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-green-700">{data.attendance.present}</p>
                  <p className="text-sm text-slate-600 mt-1">Present</p>
                </div>
                <div className="flex-1 bg-red-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-red-700">{data.attendance.absent}</p>
                  <p className="text-sm text-slate-600 mt-1">Absent</p>
                </div>
                <div className="flex-1 bg-slate-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-slate-700">{data.attendance.total}</p>
                  <p className="text-sm text-slate-600 mt-1">Marked</p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-4">Recent Notices</h3>
              <div className="space-y-3">
                {data.notices.map(n => (
                  <div key={n._id} className="border-l-4 border-primary-500 pl-3">
                    <p className="font-medium text-sm">{n.title}</p>
                    <p className="text-xs text-slate-500">{new Date(n.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
                {data.notices.length === 0 && <p className="text-sm text-slate-500">No notices</p>}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Teacher */}
      {user.role === 'teacher' && data.teacher && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="My Classes" value={data.teacher.classes?.length || 0} icon="🏫" color="primary" />
            <StatCard title="Employee ID" value={data.teacher.employeeId} icon="🆔" color="purple" />
            <StatCard title="Subjects" value={data.teacher.subjects?.length || 0} icon="📚" color="green" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold mb-4">My Classes</h3>
              {data.teacher.classes?.map(c => (
                <div key={c._id} className="p-3 bg-slate-50 rounded-lg mb-2">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.students?.length} students</p>
                </div>
              ))}
            </div>
            <div className="card">
              <h3 className="font-semibold mb-4">Upcoming Exams</h3>
              {data.exams.map(e => (
                <div key={e._id} className="p-3 bg-slate-50 rounded-lg mb-2">
                  <p className="font-medium text-sm">{e.title}</p>
                  <p className="text-xs text-slate-500">{new Date(e.startDate).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Student */}
      {user.role === 'student' && data.student && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Grade" value={data.student.grade} icon="🎓" color="primary" />
            <StatCard title="Admission No." value={data.student.admissionNumber} icon="🆔" color="purple" />
            <StatCard title="Class" value={data.student.class?.name || 'N/A'} icon="🏫" color="green" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold mb-4">Recent Attendance</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data.attendance?.slice(0, 10).map(a => (
                  <div key={a._id} className="flex justify-between items-center p-2 border-b">
                    <span className="text-sm">{new Date(a.date).toLocaleDateString()}</span>
                    <span className={
                      a.status === 'present' ? 'badge-green' :
                      a.status === 'absent' ? 'badge-red' : 'badge-yellow'
                    }>{a.status}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 className="font-semibold mb-4">Upcoming Exams</h3>
              {data.exams.map(e => (
                <div key={e._id} className="p-3 bg-slate-50 rounded-lg mb-2">
                  <p className="font-medium text-sm">{e.title}</p>
                  <p className="text-xs text-slate-500">{new Date(e.startDate).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Guardian */}
      {user.role === 'guardian' && data.guardian && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Children" value={data.guardian.children?.length || 0} icon="👪" color="primary" />
            <StatCard title="Notices" value={data.notices?.length || 0} icon="📢" color="yellow" />
            <StatCard title="Upcoming Exams" value={data.exams?.length || 0} icon="📝" color="green" />
          </div>
          <div className="card">
            <h3 className="font-semibold mb-4">My Children</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.guardian.children?.map(c => (
                <Link key={c._id} to="/progress" className="p-4 border rounded-lg hover:bg-slate-50 transition">
                  <p className="font-medium">{c.firstName} {c.lastName}</p>
                  <p className="text-xs text-slate-500 mt-1">Adm No: {c.admissionNumber}</p>
                  <p className="text-xs text-slate-500">Grade: {c.grade} {c.section}</p>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
