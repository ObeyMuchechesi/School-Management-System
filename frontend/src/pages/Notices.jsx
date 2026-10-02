import { useEffect, useState } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const priorityColors = {
  low: 'badge-gray', normal: 'badge-blue', high: 'badge-yellow', urgent: 'badge-red'
};

export default function Notices() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', audience: ['all'], priority: 'normal' });

  const canPost = user.role === 'admin' || user.role === 'teacher';

  const load = () => api.get('/notices').then(r => setNotices(r.data));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    await api.post('/notices', form);
    setShowModal(false);
    setForm({ title: '', content: '', audience: ['all'], priority: 'normal' });
    load();
  };

  const remove = async (id) => {
    if (confirm('Delete notice?')) { await api.delete(`/notices/${id}`); load(); }
  };

  const toggleAudience = (a) => {
    setForm(f => ({
      ...f,
      audience: f.audience.includes(a) ? f.audience.filter(x => x !== a) : [...f.audience, a]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Notice Board</h1>
          <p className="text-slate-500 text-sm">Announcements for the school community</p>
        </div>
        {canPost && <button className="btn-primary" onClick={() => setShowModal(true)}>+ Post Notice</button>}
      </div>

      <div className="space-y-4">
        {notices.map(n => (
          <div key={n._id} className="card">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-lg">{n.title}</h3>
                <span className={priorityColors[n.priority]}>{n.priority}</span>
              </div>
              {canPost && <button className="text-red-600 text-sm hover:underline" onClick={() => remove(n._id)}>Delete</button>}
            </div>
            <p className="text-slate-700 whitespace-pre-wrap">{n.content}</p>
            <div className="flex items-center gap-4 mt-4 pt-3 border-t text-xs text-slate-500">
              <span>👤 {n.postedBy?.name || 'Admin'}</span>
              <span>📅 {new Date(n.createdAt).toLocaleString()}</span>
              <div className="flex gap-1">
                {n.audience.map(a => <span key={a} className="badge-gray capitalize">{a}</span>)}
              </div>
            </div>
          </div>
        ))}
        {notices.length === 0 && <div className="card text-center py-12 text-slate-500">No notices yet</div>}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Post Notice" size="lg">
        <form onSubmit={save} className="space-y-4">
          <div><label className="label">Title</label><input className="input" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
          <div><label className="label">Content</label><textarea className="input" rows="5" required value={form.content} onChange={e => setForm({...form, content: e.target.value})} /></div>
          <div>
            <label className="label">Audience</label>
            <div className="flex flex-wrap gap-3">
              {['all','students','teachers','guardians','staff'].map(a => (
                <label key={a} className="flex items-center gap-2 text-sm capitalize">
                  <input type="checkbox" checked={form.audience.includes(a)} onChange={() => toggleAudience(a)} /> {a}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Priority</label>
            <select className="input" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
              <option value="low">Low</option><option value="normal">Normal</option>
              <option value="high">High</option><option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary">Post</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
