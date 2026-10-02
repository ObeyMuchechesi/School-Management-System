import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

export default function Progress() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    student: '', term: 'Term 1', academicYear: '2024/2025',
    subjects: [{ subject: '', score: 0, grade: '', teacherComment: '' }],
    overallGrade: '', conduct: 'Good', attendanceRate: 0,
    classTeacherComment: '', published: true
  });

  const canManage = user.role === 'admin' || user.role === 'teacher';

  useEffect(() => {
    if (canManage) {
      api.get('/students').then(r => setStudents(r.data)).catch(() => {});
      api.get('/progress').then(r => setReports(r.data)).catch(() => {});
    }
    if (user.role === 'student' && user.studentProfile) {
      api.get(`/progress/student/${user.studentProfile}`).then(r => setReports(r.data));
    }
    if (user.role === 'guardian' && user.guardianProfile) {
      api.get('/guardians/me').then(g => {
        const children = g.data.children || [];
        if (children.length) {
          setStudents(children);
          setSelectedChild(children[0]._id);
          api.get(`/progress/student/${children[0]._id}`).then(r => setReports(r.data));
        }
      });
    }
  }, [user]);

  const switchChild = (id) => {
    setSelectedChild(id);
    api.get(`/progress/student/${id}`).then(r => setReports(r.data));
  };

  const save = async (e) => {
    e.preventDefault();
    await api.post('/progress', form);
    setShowModal(false);
    api.get('/progress').then(r => setReports(r.data));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Progress Reports</h1>
          <p className="text-slate-500 text-sm">Academic performance tracking</p>
        </div>
        {canManage && <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add Report</button>}
      </div>

      {user.role === 'guardian' && students.length > 1 && (
        <div className="card">
          <label className="label">Select Child</label>
          <select className="input max-w-xs" value={selectedChild || ''} onChange={e => switchChild(e.target.value)}>
            {students.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>)}
          </select>
        </div>
      )}

      <div className="space-y-4">
        {reports.map(r => (
          <div key={r._id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">{r.student?.firstName} {r.student?.lastName}</h3>
                <p className="text-xs text-slate-500">{r.term} · {r.academicYear}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-600">{r.overallGrade}</p>
                <p className="text-xs text-slate-500">Overall Grade</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-slate-50 p-3 rounded-lg text-center">
                <p className="text-xs text-slate-500">Conduct</p>
                <p className="font-medium">{r.conduct}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg text-center">
                <p className="text-xs text-slate-500">Attendance</p>
                <p className="font-medium">{r.attendanceRate}%</p>
              </div>
            </div>
            <table className="table">
              <thead><tr><th>Subject</th><th>Score</th><th>Grade</th><th>Comment</th></tr></thead>
              <tbody>
                {r.subjects?.map((s, i) => (
                  <tr key={i}>
                    <td>{s.subject}</td>
                    <td>{s.score}</td>
                    <td><span className="badge-blue">{s.grade}</span></td>
                    <td className="text-xs text-slate-500">{s.teacherComment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {r.classTeacherComment && (
              <p className="text-sm text-slate-600 mt-3 p-3 bg-yellow-50 rounded-lg">
                <strong>Class Teacher:</strong> {r.classTeacherComment}
              </p>
            )}
          </div>
        ))}
        {reports.length === 0 && <div className="card text-center py-12 text-slate-500">No reports available</div>}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Progress Report" size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Student</label>
              <select className="input" required value={form.student} onChange={e => setForm({...form, student: e.target.value})}>
                <option value="">Select</option>
                {students.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>)}
              </select>
            </div>
            <div><label className="label">Term</label><input className="input" value={form.term} onChange={e => setForm({...form, term: e.target.value})} /></div>
            <div><label className="label">Academic Year</label><input className="input" value={form.academicYear} onChange={e => setForm({...form, academicYear: e.target.value})} /></div>
            <div><label className="label">Overall Grade</label><input className="input" value={form.overallGrade} onChange={e => setForm({...form, overallGrade: e.target.value})} /></div>
            <div><label className="label">Conduct</label><input className="input" value={form.conduct} onChange={e => setForm({...form, conduct: e.target.value})} /></div>
            <div className="col-span-2"><label className="label">Attendance Rate (%)</label><input type="number" className="input" value={form.attendanceRate} onChange={e => setForm({...form, attendanceRate: Number(e.target.value)})} /></div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="label mb-0">Subjects</label>
              <button type="button" className="text-primary-600 text-sm" onClick={() => setForm(f => ({ ...f, subjects: [...f.subjects, { subject: '', score: 0, grade: '', teacherComment: '' }] }))}>+ Add</button>
            </div>
            {form.subjects.map((s, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 mb-2">
                <input className="input col-span-4" placeholder="Subject" value={s.subject}
                  onChange={e => { const arr = [...form.subjects]; arr[i].subject = e.target.value; setForm({...form, subjects: arr}); }} />
                <input type="number" className="input col-span-2" placeholder="Score" value={s.score}
                  onChange={e => { const arr = [...form.subjects]; arr[i].score = Number(e.target.value); setForm({...form, subjects: arr}); }} />
                <input className="input col-span-2" placeholder="Grade" value={s.grade}
                  onChange={e => { const arr = [...form.subjects]; arr[i].grade = e.target.value; setForm({...form, subjects: arr}); }} />
                <input className="input col-span-4" placeholder="Comment" value={s.teacherComment}
                  onChange={e => { const arr = [...form.subjects]; arr[i].teacherComment = e.target.value; setForm({...form, subjects: arr}); }} />
              </div>
            ))}
          </div>
          <div><label className="label">Class Teacher Comment</label><textarea className="input" rows="2" value={form.classTeacherComment} onChange={e => setForm({...form, classTeacherComment: e.target.value})} /></div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
