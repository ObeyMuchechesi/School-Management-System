import { useEffect, useState } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export default function Guardians() {
  const { user } = useAuth();
  const [guardians, setGuardians] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', relationship: 'father', phone: '', occupation: '', address: '', children: [] });

  const load = () => {
    api.get('/guardians').then(r => setGuardians(r.data));
    api.get('/students').then(r => setStudents(r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ firstName: '', lastName: '', relationship: 'father', phone: '', occupation: '', address: '', children: [] });
    setShowModal(true);
  };
  const openEdit = (g) => {
    setEditing(g);
    setForm({ ...g, children: g.children?.map(c => c._id) || [] });
    setShowModal(true);
  };
  const save = async (e) => {
    e.preventDefault();
    if (editing) await api.put(`/guardians/${editing._id}`, form);
    else await api.post('/guardians', form);
    setShowModal(false); load();
  };
  const remove = async (id) => { if (confirm('Delete?')) { await api.delete(`/guardians/${id}`); load(); } };

  const toggleChild = (id) => {
    setForm(f => ({
      ...f,
      children: f.children.includes(id) ? f.children.filter(c => c !== id) : [...f.children, id]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Guardians</h1>
          <p className="text-slate-500 text-sm">{guardians.length} registered</p>
        </div>
        {user.role === 'admin' && <button className="btn-primary" onClick={openCreate}>+ Add Guardian</button>}
      </div>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Relationship</th><th>Phone</th><th>Children</th>{user.role === 'admin' && <th>Actions</th>}</tr>
          </thead>
          <tbody>
            {guardians.map(g => (
              <tr key={g._id}>
                <td className="font-medium">{g.firstName} {g.lastName}</td>
                <td className="capitalize">{g.relationship}</td>
                <td>{g.phone || '—'}</td>
                <td>{g.children?.map(c => `${c.firstName} ${c.lastName}`).join(', ') || '—'}</td>
                {user.role === 'admin' && (
                  <td className="space-x-2">
                    <button className="text-primary-600 hover:underline text-sm" onClick={() => openEdit(g)}>Edit</button>
                    <button className="text-red-600 hover:underline text-sm" onClick={() => remove(g._id)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
            {guardians.length === 0 && <tr><td colSpan="5" className="text-center py-8 text-slate-500">No guardians</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Guardian' : 'Add Guardian'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">First Name</label><input className="input" required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} /></div>
            <div><label className="label">Last Name</label><input className="input" required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} /></div>
            <div>
              <label className="label">Relationship</label>
              <select className="input" value={form.relationship} onChange={e => setForm({...form, relationship: e.target.value})}>
                <option value="father">Father</option><option value="mother">Mother</option>
                <option value="guardian">Guardian</option><option value="other">Other</option>
              </select>
            </div>
            <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            <div><label className="label">Occupation</label><input className="input" value={form.occupation} onChange={e => setForm({...form, occupation: e.target.value})} /></div>
            <div><label className="label">Address</label><input className="input" value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
          </div>
          <div>
            <label className="label">Link Children</label>
            <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
              {students.map(s => (
                <label key={s._id} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" checked={form.children.includes(s._id)} onChange={() => toggleChild(s._id)} />
                  <span>{s.firstName} {s.lastName} ({s.admissionNumber})</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
