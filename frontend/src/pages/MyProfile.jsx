import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function MyProfile() {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');

  const changePassword = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setMsg('Passwords do not match');
    try {
      await api.put(`/users/${user._id}/password`, { password });
      setMsg('Password updated successfully');
      setPassword(''); setConfirm('');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-slate-500 text-sm">Account information</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold text-lg">{user?.name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <span className="badge-blue mt-1 capitalize">{user?.role}</span>
          </div>
        </div>
      </div>

      <form onSubmit={changePassword} className="card space-y-4">
        <h3 className="font-semibold">🔒 Change Password</h3>
        {msg && <div className="p-2 bg-blue-50 text-blue-700 rounded text-sm">{msg}</div>}
        <div><label className="label">New Password</label><input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} required /></div>
        <div><label className="label">Confirm Password</label><input type="password" className="input" value={confirm} onChange={e => setConfirm(e.target.value)} required /></div>
        <div className="flex justify-end"><button className="btn-primary">Update Password</button></div>
      </form>
    </div>
  );
}
