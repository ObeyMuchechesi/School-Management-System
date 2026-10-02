import { useEffect, useState } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export default function Teachers() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ employeeId: '', firstName: '', lastName: '', subjects: '', qualification: '', phone: '' });

  const load = () => api.get('/teachers').then(r => setTeachers(r.data));
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ employeeId: '', firstName: '', lastName: '', subjects: '', qualification: '', phone: '' });
    setShowModal(true);
  };
  const openEdit = (t) => {
    setEditing(t);
    setForm({ ...t, subjects: (t.subjects || []).join(', ') });
    setShowModal(true);
  };
  const save = async (e) => {
    e.preventDefault();
    const data = { ...form, subjects: form.subjects.split(',').map(s => s.trim()).filter(Boolean) };
    if (editing) await api.put(`/teachers/${editing._id}`, data);
    else await api.post('/teachers', data);
    setShowModal(false); load();
  };
  const remove = async (id) => { if (confirm('Delete?')) { await api.delete(`/teachers/${id}`); load(); } };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Faculty Roster</h1>
          <p className="text-slate-500 text-sm">{teachers.length} teachers</p>
        </div>
        {user.role === 'admin' && <button className="btn-primary" onClick={openCreate}>+ Add Teacher</button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map(t => (
          <div key={t._id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg">
                {t.firstName.charAt(0)}{t.lastName.charAt(0)}
              </div>
              {user.role === 'admin' && (
                <div className="space-x-2">
                  <button className="text-primary-600 text-sm hover:underline" onClick={() => openEdit(t)}>Edit</button>
                  <button className="text-red-600 text-sm hover:underline" onClick={() => remove(t._id)}>Delete</button>
                </div>
              )}
            </div>
            <h3 className="font-semibold">{t.firstName} {t.lastName}</h3>
            <p className="text-xs text-slate-500 font-mono">{t.employeeId}</p>
            <div className="mt-3">
              <p className="text-xs text-slate-500 mb-1">Subjects:</p>
              <div className="flex flex-wrap gap-1">
                {(t.subjects || []).map(s => <span key={s} className="badge-blue">{s}</span>)}
              </div>
            </div>
            {t.qualification && <p className="text-xs text-slate-500 mt-3">🎓 {t.qualification}</p>}
            {t.phone && <p className="text-xs text-slate-500">📞 {t.phone}</p>}
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Teacher' : 'Add Teacher'}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Employee ID</label><input className="input" required value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})} /></div>
            <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            <div><label className="label">First Name</label><input className="input" required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} /></div>
            <div><label className="label">Last Name</label><input className="input" required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} /></div>
          </div>
          <div><label className="label">Subjects (comma-separated)</label><input className="input" value={form.subjects} onChange={e => setForm({...form, subjects: e.target.value})} /></div>
          <div><label className="label">Qualification</label><input className="input" value={form.qualification} onChange={e => setForm({...form, qualification: e.target.value})} /></div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
