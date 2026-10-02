import { useEffect, useState } from 'react';
import api from '../api';

export default function Attendance() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Fetch classes via students — fallback: unique classes
    api.get('/timetable').then(r => {
      const unique = {};
      r.data.forEach(t => { if (t.class) unique[t.class._id] = t.class; });
      setClasses(Object.values(unique));
      if (Object.values(unique)[0]) setClassId(Object.values(unique)[0]._id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!classId) return;
    api.get('/students').then(r => {
      const cls = classes.find(c => c._id === classId);
      const list = r.data.filter(s => s.class?._id === classId || (cls && s.grade === cls.grade && s.section === cls.section));
      setStudents(list);
      // Load existing attendance
      api.get(`/attendance/class/${classId}?date=${date}`).then(res => {
        const map = {};
        res.data.forEach(a => { map[a.student._id] = { status: a.status, remarks: a.remarks }; });
        setRecords(map);
      }).catch(() => setRecords({}));
    });
  }, [classId, date, classes]);

  const setStatus = (studentId, status) => {
    setRecords(r => ({ ...r, [studentId]: { ...r[studentId], status } }));
  };

  const markAll = (status) => {
    const map = {};
    students.forEach(s => { map[s._id] = { status }; });
    setRecords(map);
  };

  const save = async () => {
    const recs = students.map(s => ({
      student: s._id,
      status: records[s._id]?.status || 'present',
      remarks: records[s._id]?.remarks || ''
    }));
    await api.post('/attendance/bulk', { classId, date, records: recs });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Attendance Register</h1>
        <p className="text-slate-500 text-sm">Daily attendance marking</p>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="label">Class</label>
            <select className="input" value={classId} onChange={e => setClassId(e.target.value)}>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary btn-sm" onClick={() => markAll('present')}>✓ All Present</button>
            <button className="btn-secondary btn-sm" onClick={() => markAll('absent')}>✗ All Absent</button>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr><th>Student</th><th>Adm No.</th><th>Status</th><th>Remarks</th></tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s._id}>
                <td className="font-medium">{s.firstName} {s.lastName}</td>
                <td className="font-mono text-xs">{s.admissionNumber}</td>
                <td>
                  <div className="flex gap-2">
                    {['present', 'absent', 'late', 'excused'].map(st => (
                      <button key={st}
                        onClick={() => setStatus(s._id, st)}
                        className={`px-2 py-1 rounded text-xs font-medium transition ${
                          records[s._id]?.status === st
                            ? st === 'present' ? 'bg-green-600 text-white'
                              : st === 'absent' ? 'bg-red-600 text-white'
                              : st === 'late' ? 'bg-yellow-500 text-white'
                              : 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}>
                        {st.charAt(0).toUpperCase() + st.slice(1)}
                      </button>
                    ))}
                  </div>
                </td>
                <td>
                  <input className="input text-sm py-1" placeholder="Optional"
                    value={records[s._id]?.remarks || ''}
                    onChange={e => setRecords(r => ({ ...r, [s._id]: { ...r[s._id], remarks: e.target.value } }))} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button className="btn-primary" onClick={save} disabled={!students.length}>
          {saved ? '✓ Saved!' : 'Save Attendance'}
        </button>
      </div>
    </div>
  );
}
