import { useEffect, useState } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export default function Exams() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [cards, setCards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [form, setForm] = useState({ title: '', term: 'Term 1', academicYear: '2024/2025', startDate: '', endDate: '', grades: '' });
  const [cardForm, setCardForm] = useState({ exam: '', subjects: [{ subject: '', score: 0 }], overallGrade: '', teacherComment: '', published: true });
  const [students, setStudents] = useState([]);

  const canManage = user.role === 'admin' || user.role === 'teacher';

  useEffect(() => {
    api.get('/exams').then(r => setExams(r.data));
    if (canManage) api.get('/students').then(r => setStudents(r.data)).catch(() => {});
    if (user.role === 'student' && user.studentProfile) {
      api.get(`/exams/cards/student/${user.studentProfile}`).then(r => setCards(r.data));
    } else if (user.role === 'guardian' && user.guardianProfile) {
      api.get('/guardians/me').then(g => {
        const child = g.data.children?.[0];
        if (child) api.get(`/exams/cards/student/${child._id}`).then(r => setCards(r.data));
      });
    }
  }, [user]);

  const saveExam = async (e) => {
    e.preventDefault();
    await api.post('/exams', { ...form, grades: form.grades.split(',').map(s => s.trim()) });
    setShowModal(false);
    api.get('/exams').then(r => setExams(r.data));
  };

  const saveCard = async (e) => {
    e.preventDefault();
    const data = { ...cardForm, student: cardForm.student };
    await api.post('/exams/cards', data);
    setShowCardModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Examinations</h1>
          <p className="text-slate-500 text-sm">Exam schedules & report cards</p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={() => setShowCardModal(true)}>+ Exam Card</button>
            <button className="btn-primary" onClick={() => setShowModal(true)}>+ Create Exam</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exams.map(e => {
          const upcoming = new Date(e.endDate) >= new Date();
          return (
            <div key={e._id} className="card">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{e.title}</h3>
                <span className={upcoming ? 'badge-green' : 'badge-gray'}>
                  {upcoming ? 'Upcoming' : 'Past'}
                </span>
              </div>
              <p className="text-xs text-slate-500">{e.term} · {e.academicYear}</p>
              <p className="text-xs text-slate-500 mt-1">
                📅 {new Date(e.startDate).toLocaleDateString()} → {new Date(e.endDate).toLocaleDateString()}
              </p>
              <div className="mt-3">
                <p className="text-xs text-slate-500 mb-1">Schedule:</p>
                {e.schedule?.slice(0, 3).map((s, i) => (
                  <div key={i} className="text-xs py-1 border-t">
                    <span className="font-medium">{s.subject}</span> · {new Date(s.date).toLocaleDateString()} · {s.startTime}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {exams.length === 0 && <div className="card text-center text-slate-500 col-span-3 py-8">No exams scheduled</div>}
      </div>

      {(user.role === 'student' || user.role === 'guardian') && cards.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-4">📝 Report Cards</h3>
          <div className="space-y-4">
            {cards.map(c => (
              <div key={c._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="font-semibold">{c.exam?.title}</p>
                    <p className="text-xs text-slate-500">Overall: {c.overallGrade}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-600">{c.average?.toFixed(1)}%</p>
                  </div>
                </div>
                <table className="table">
                  <thead><tr><th>Subject</th><th>Score</th><th>Grade</th></tr></thead>
                  <tbody>
                    {c.subjects.map((s, i) => (
                      <tr key={i}><td>{s.subject}</td><td>{s.score}</td><td><span className="badge-blue">{s.grade}</span></td></tr>
                    ))}
                  </tbody>
                </table>
                {c.teacherRemarks && <p className="text-sm mt-3 text-slate-600"><strong>Teacher:</strong> {c.teacherRemarks}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Exam" size="lg">
        <form onSubmit={saveExam} className="space-y-4">
          <div><label className="label">Title</label><input className="input" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Term</label><input className="input" value={form.term} onChange={e => setForm({...form, term: e.target.value})} /></div>
            <div><label className="label">Academic Year</label><input className="input" value={form.academicYear} onChange={e => setForm({...form, academicYear: e.target.value})} /></div>
            <div><label className="label">Start Date</label><input type="date" className="input" required value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} /></div>
            <div><label className="label">End Date</label><input type="date" className="input" required value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} /></div>
          </div>
          <div><label className="label">Grades (comma-separated)</label><input className="input" placeholder="5, 6, 7" value={form.grades} onChange={e => setForm({...form, grades: e.target.value})} /></div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary">Create</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showCardModal} onClose={() => setShowCardModal(false)} title="Create Exam Card" size="lg">
        <form onSubmit={saveCard} className="space-y-4">
          <div>
            <label className="label">Student</label>
            <select className="input" required value={cardForm.student || ''} onChange={e => setCardForm({...cardForm, student: e.target.value})}>
              <option value="">Select student</option>
              {students.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Exam</label>
            <select className="input" required value={cardForm.exam} onChange={e => setCardForm({...cardForm, exam: e.target.value})}>
              <option value="">Select exam</option>
              {exams.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
            </select>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="label mb-0">Subjects</label>
              <button type="button" className="text-primary-600 text-sm" onClick={() => setCardForm(f => ({ ...f, subjects: [...f.subjects, { subject: '', score: 0 }] }))}>+ Add</button>
            </div>
            {cardForm.subjects.map((s, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input className="input flex-1" placeholder="Subject" value={s.subject}
                  onChange={e => { const arr = [...cardForm.subjects]; arr[i].subject = e.target.value; setCardForm({...cardForm, subjects: arr}); }} />
                <input type="number" className="input w-24" placeholder="Score" value={s.score}
                  onChange={e => { const arr = [...cardForm.subjects]; arr[i].score = Number(e.target.value); setCardForm({...cardForm, subjects: arr}); }} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Overall Grade</label><input className="input" value={cardForm.overallGrade} onChange={e => setCardForm({...cardForm, overallGrade: e.target.value})} /></div>
            <div><label className="label">Published</label>
              <select className="input" value={cardForm.published} onChange={e => setCardForm({...cardForm, published: e.target.value === 'true'})}>
                <option value="true">Yes</option><option value="false">No</option>
              </select>
            </div>
          </div>
          <div><label className="label">Teacher Remarks</label><textarea className="input" rows="2" value={cardForm.teacherComment} onChange={e => setCardForm({...cardForm, teacherComment: e.target.value})} /></div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setShowCardModal(false)}>Cancel</button>
            <button className="btn-primary">Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
