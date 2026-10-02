import { useEffect, useState } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export default function Students() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    admissionNumber: '', firstName: '', lastName: '', gender: 'male',
    grade: '', section: '', dateOfBirth: '', bloodGroup: '', medicalNotes: ''
  });

  const load = () => api.get('/students').then(r => setStudents(r.data));
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ admissionNumber: '', firstName: '', lastName: '', gender: 'male', grade: '', section: '', dateOfBirth: '', bloodGroup: '', medicalNotes: '' });
    setShowModal(true);
  };
  const openEdit = (s) => {
    setEditing(s);
    setForm({ ...s, dateOfBirth: s.dateOfBirth?.slice(0,10) || '' });
    setShowModal(true);
  };
  const save = async (e) => {
    e.preventDefault();
    if (editing) await api.put(`/students/${editing._id}`, form);
    else await api.post('/students', form);
    setShowModal(false); load();
  };
  const remove = async (id) => {
    if (confirm('Delete this student?')) { await api.delete(`/students/${id}`); load(); }
  };

  const filtered = students.filter(s =>
    `${s.firstName} ${s.lastName} ${s.admissionNumber} ${s.grade}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Student Records</h1>
          <p className="text-slate-500 text-sm">{students.length} students enrolled</p>
        </div>
        <div className="flex gap-2">
          <input className="input" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          {user.role === 'admin' && <button className="btn-primary" onClick={openCreate}>+ Add Student</button>}
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Adm No.</th><th>Name</th><th>Grade</th><th>Gender</th>
              <th>Guardians</th><th>Status</th>
              {user.role === 'admin' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s._id}>
                <td className="font-mono text-xs">{s.admissionNumber}</td>
                <td className="font-medium">{s.firstName} {s.lastName}</td>
                <td>{s.grade} {s.section}</td>
                <td className="capitalize">{s.gender}</td>
                <td>{s.guardians?.map(g => `${g.firstName} ${g.lastName}`).join(', ') || '—'}</td>
                <td>{s.isActive ? <span className="badge-green">Active</span> : <span className="badge-red">Inactive</span>}</td>
                {user.role === 'admin' && (
                  <td className="space-x-2">
                    <button className="text-primary-600 hover:underline text-sm" onClick={() => openEdit(s)}>Edit</button>
                    <button className="text-red-600 hover:underline text-sm" onClick={() => remove(s._id)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="7" className="text-center py-8 text-slate-500">No students found</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Student' : 'Add Student'}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Admission No.</label><input className="input" required value={form.admissionNumber} onChange={e => setForm({...form, admissionNumber: e.target.value})} /></div>
            <div><label className="label">Grade</label><input className="input" required value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} /></div>
            <div><label className="label">First Name</label><input className="input" required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} /></div>
            <div><label className="label">Last Name</label><input className="input" required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} /></div>
            <div>
              <label className="label">Gender</label>
              <select className="input" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
              </select>
            </div>
            <div><label className="label">Section</label><input className="input" value={form.section} onChange={e => setForm({...form, section: e.target.value})} /></div>
            <div><label className="label">Date of Birth</label><input type="date" className="input" value={form.dateOfBirth} onChange={e => setForm({...form, dateOfBirth: e.target.value})} /></div>
            <div><label className="label">Blood Group</label><input className="input" value={form.bloodGroup} onChange={e => setForm({...form, bloodGroup: e.target.value})} /></div>
          </div>
          <div><label className="label">Medical Notes</label><textarea className="input" rows="2" value={form.medicalNotes} onChange={e => setForm({...form, medicalNotes: e.target.value})} /></div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
