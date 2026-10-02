import { useEffect, useState } from 'react';
import api from '../api';

export default function Settings() {
  const [settings, setSettings] = useState({});
  const [bell, setBell] = useState({ periods: [] });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/settings').then(r => setSettings(r.data));
    api.get('/settings/bell').then(r => setBell(r.data || { periods: [] })).catch(() => {});
  }, []);

  const saveSchool = async (e) => {
    e.preventDefault();
    await api.put('/settings', settings);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const saveBell = async () => {
    await api.put('/settings/bell', bell);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const addPeriod = () => setBell(b => ({ ...b, periods: [...(b.periods || []), { label: '', startTime: '', endTime: '' }] }));
  const updatePeriod = (i, key, val) => {
    const arr = [...bell.periods];
    arr[i] = { ...arr[i], [key]: val };
    setBell({ ...bell, periods: arr });
  };
  const removePeriod = (i) => setBell({ ...bell, periods: bell.periods.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Settings</h1>
        <p className="text-slate-500 text-sm">School-wide configuration</p>
      </div>

      {saved && <div className="p-3 bg-green-50 text-green-700 rounded-lg">✓ Settings saved</div>}

      <form onSubmit={saveSchool} className="card space-y-4">
        <h3 className="font-semibold">🏫 School Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="label">School Name</label><input className="input" value={settings.schoolName || ''} onChange={e => setSettings({...settings, schoolName: e.target.value})} /></div>
          <div><label className="label">Motto</label><input className="input" value={settings.motto || ''} onChange={e => setSettings({...settings, motto: e.target.value})} /></div>
          <div><label className="label">Email</label><input className="input" value={settings.email || ''} onChange={e => setSettings({...settings, email: e.target.value})} /></div>
          <div><label className="label">Phone</label><input className="input" value={settings.phone || ''} onChange={e => setSettings({...settings, phone: e.target.value})} /></div>
          <div className="md:col-span-2"><label className="label">Address</label><input className="input" value={settings.address || ''} onChange={e => setSettings({...settings, address: e.target.value})} /></div>
          <div><label className="label">Current Term</label><input className="input" value={settings.currentTerm || ''} onChange={e => setSettings({...settings, currentTerm: e.target.value})} /></div>
          <div><label className="label">Academic Year</label><input className="input" value={settings.currentAcademicYear || ''} onChange={e => setSettings({...settings, currentAcademicYear: e.target.value})} /></div>
          <div><label className="label">Currency</label><input className="input" value={settings.currency || ''} onChange={e => setSettings({...settings, currency: e.target.value})} /></div>
        </div>
        <div className="flex justify-end">
          <button className="btn-primary">Save Settings</button>
        </div>
      </form>

      <div className="card space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">🔔 Bell Schedule</h3>
          <button type="button" className="text-primary-600 text-sm" onClick={addPeriod}>+ Add Period</button>
        </div>
        {(bell.periods || []).map((p, i) => (
          <div key={i} className="grid grid-cols-12 gap-2">
            <input className="input col-span-4" placeholder="Label (e.g. Period 1)" value={p.label} onChange={e => updatePeriod(i, 'label', e.target.value)} />
            <input type="time" className="input col-span-3" value={p.startTime} onChange={e => updatePeriod(i, 'startTime', e.target.value)} />
            <input type="time" className="input col-span-3" value={p.endTime} onChange={e => updatePeriod(i, 'endTime', e.target.value)} />
            <button type="button" className="text-red-600 col-span-2" onClick={() => removePeriod(i)}>Remove</button>
          </div>
        ))}
        <div className="flex justify-end">
          <button onClick={saveBell} className="btn-primary" type="button">Save Bell Schedule</button>
        </div>
      </div>
    </div>
  );
}
