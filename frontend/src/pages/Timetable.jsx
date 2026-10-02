import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday'];

export default function Timetable() {
  const { user } = useAuth();
  const [timetables, setTimetables] = useState([]);
  const [selected, setSelected] = useState(null);
  const [bell, setBell] = useState(null);
  const [studentTt, setStudentTt] = useState(null);

  useEffect(() => {
    api.get('/settings/bell').then(r => setBell(r.data)).catch(() => {});

    if (user.role === 'student' && user.studentProfile) {
      api.get(`/timetable/student/${user.studentProfile}`).then(r => setStudentTt(r.data)).catch(() => {});
    } else if (user.role === 'guardian' && user.guardianProfile) {
      api.get('/guardians/me').then(g => {
        const child = g.data.children?.[0];
        if (child) api.get(`/timetable/student/${child._id}`).then(r => setStudentTt(r.data)).catch(() => {});
      });
    } else {
      api.get('/timetable').then(r => {
        setTimetables(r.data);
        if (r.data[0]) setSelected(r.data[0]);
      });
    }
  }, [user]);

  const active = user.role === 'student' || user.role === 'guardian' ? studentTt : selected;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Timetable</h1>
        <p className="text-slate-500 text-sm">Weekly class schedule</p>
      </div>

      {bell && (
        <div className="card">
          <h3 className="font-semibold mb-3">🔔 Bell Schedule</h3>
          <div className="flex flex-wrap gap-2">
            {bell.periods?.map((p, i) => (
              <div key={i} className="px-3 py-2 bg-slate-50 rounded-lg text-sm">
                <p className="font-medium">{p.label}</p>
                <p className="text-xs text-slate-500">{p.startTime} - {p.endTime}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {user.role !== 'student' && user.role !== 'guardian' && timetables.length > 0 && (
        <div className="card">
          <label className="label">Select Class</label>
          <select className="input max-w-xs" value={selected?._id || ''}
            onChange={e => setSelected(timetables.find(t => t._id === e.target.value))}>
            {timetables.map(t => <option key={t._id} value={t._id}>{t.class?.name || 'Class'}</option>)}
          </select>
        </div>
      )}

      {active ? (
        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Period</th>
                {DAYS.map(d => <th key={d}>{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {Array.from(new Set(active.slots.map(s => s.period))).sort((a,b) => a-b).map(period => (
                <tr key={period}>
                  <td className="font-medium bg-slate-50">Period {period}</td>
                  {DAYS.map(day => {
                    const slot = active.slots.find(s => s.day === day && s.period === period);
                    return (
                      <td key={day} className="text-sm">
                        {slot ? (
                          <div>
                            <p className="font-medium text-slate-800">{slot.subject}</p>
                            <p className="text-xs text-slate-500">{slot.startTime}-{slot.endTime}</p>
                            {slot.teacher && <p className="text-xs text-slate-400">{slot.teacher.firstName} {slot.teacher.lastName}</p>}
                          </div>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card text-center text-slate-500 py-12">No timetable available</div>
      )}
    </div>
  );
}
