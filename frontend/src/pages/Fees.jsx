import { useEffect, useState } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import StatCard from '../components/StatCard';

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    student: '', term: 'Term 1', academicYear: '2024/2025',
    feeStructure: [{ item: 'Tuition', amount: 0 }],
    totalAmount: 0, dueDate: ''
  });
  const [payForm, setPayForm] = useState({ amount: '', method: 'cash', reference: '', note: '' });

  const load = () => {
    api.get('/fees').then(r => setFees(r.data));
    api.get('/students').then(r => setStudents(r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const addItem = () => setForm(f => ({ ...f, feeStructure: [...f.feeStructure, { item: '', amount: 0 }] }));
  const updateItem = (i, key, val) => {
    const arr = [...form.feeStructure];
    arr[i] = { ...arr[i], [key]: val };
    setForm(f => ({ ...f, feeStructure: arr, totalAmount: arr.reduce((s, it) => s + Number(it.amount || 0), 0) }));
  };
  const removeItem = (i) => {
    const arr = form.feeStructure.filter((_, idx) => idx !== i);
    setForm(f => ({ ...f, feeStructure: arr, totalAmount: arr.reduce((s, it) => s + Number(it.amount || 0), 0) }));
  };

  const save = async (e) => {
    e.preventDefault();
    await api.post('/fees', form);
    setShowModal(false); load();
  };

  const openPay = (fee) => {
    setSelectedFee(fee);
    setPayForm({ amount: '', method: 'cash', reference: '', note: '' });
    setShowPayModal(true);
  };
  const recordPayment = async (e) => {
    e.preventDefault();
    await api.post(`/fees/${selectedFee._id}/payment`, { ...payForm, amount: Number(payForm.amount) });
    setShowPayModal(false); load();
  };

  const filtered = fees.filter(f =>
    `${f.student?.firstName} ${f.student?.lastName} ${f.student?.admissionNumber}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalBilled = fees.reduce((s, f) => s + f.totalAmount, 0);
  const totalCollected = fees.reduce((s, f) => s + f.amountPaid, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Fee Ledger</h1>
          <p className="text-slate-500 text-sm">Manage student fees & payments</p>
        </div>
        <div className="flex gap-2">
          <input className="input" placeholder="Search student..." value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add Fee</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Billed" value={`$${totalBilled.toLocaleString()}`} icon="📋" color="primary" />
        <StatCard title="Collected" value={`$${totalCollected.toLocaleString()}`} icon="💰" color="green" />
        <StatCard title="Outstanding" value={`$${(totalBilled - totalCollected).toLocaleString()}`} icon="⚠️" color="red" />
      </div>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr><th>Student</th><th>Term</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f._id}>
                <td className="font-medium">{f.student?.firstName} {f.student?.lastName}<br />
                  <span className="text-xs text-slate-400 font-mono">{f.student?.admissionNumber}</span>
                </td>
                <td>{f.term} / {f.academicYear}</td>
                <td>${f.totalAmount}</td>
                <td className="text-green-700">${f.amountPaid}</td>
                <td className={f.balance > 0 ? 'text-red-600 font-medium' : ''}>${f.balance}</td>
                <td>
                  <span className={
                    f.status === 'paid' ? 'badge-green' :
                    f.status === 'partial' ? 'badge-yellow' : 'badge-red'
                  }>{f.status}</span>
                </td>
                <td>
                  {f.balance > 0 && <button className="text-primary-600 hover:underline text-sm" onClick={() => openPay(f)}>Record Payment</button>}
                  {f.balance === 0 && <span className="text-xs text-slate-400">Cleared</span>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="7" className="text-center py-8 text-slate-500">No fee records</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Add Fee Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Fee Record" size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Student</label>
              <select className="input" required value={form.student} onChange={e => setForm({...form, student: e.target.value})}>
                <option value="">Select student</option>
                {students.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.admissionNumber})</option>)}
              </select>
            </div>
            <div><label className="label">Term</label><input className="input" value={form.term} onChange={e => setForm({...form, term: e.target.value})} /></div>
            <div><label className="label">Academic Year</label><input className="input" value={form.academicYear} onChange={e => setForm({...form, academicYear: e.target.value})} /></div>
            <div className="col-span-2"><label className="label">Due Date</label><input type="date" className="input" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} /></div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="label mb-0">Fee Structure</label>
              <button type="button" className="text-primary-600 text-sm" onClick={addItem}>+ Add Item</button>
            </div>
            {form.feeStructure.map((it, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input className="input flex-1" placeholder="Item (e.g., Tuition)" value={it.item} onChange={e => updateItem(i, 'item', e.target.value)} />
                <input className="input w-32" type="number" placeholder="Amount" value={it.amount} onChange={e => updateItem(i, 'amount', e.target.value)} />
                <button type="button" className="text-red-600 px-2" onClick={() => removeItem(i)}>✕</button>
              </div>
            ))}
            <p className="text-right font-semibold mt-2">Total: ${form.totalAmount}</p>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary">Create</button>
          </div>
        </form>
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={showPayModal} onClose={() => setShowPayModal(false)} title="Record Payment">
        {selectedFee && (
          <form onSubmit={recordPayment} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg text-sm">
              <p><strong>{selectedFee.student?.firstName} {selectedFee.student?.lastName}</strong></p>
              <p className="text-slate-500">Balance: ${selectedFee.balance}</p>
            </div>
            <div><label className="label">Amount</label><input type="number" required className="input" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} /></div>
            <div>
              <label className="label">Method</label>
              <select className="input" value={payForm.method} onChange={e => setPayForm({...payForm, method: e.target.value})}>
                <option value="cash">Cash</option><option value="bank_transfer">Bank Transfer</option>
                <option value="card">Card</option><option value="mobile">Mobile Money</option>
              </select>
            </div>
            <div><label className="label">Reference</label><input className="input" value={payForm.reference} onChange={e => setPayForm({...payForm, reference: e.target.value})} /></div>
            <div><label className="label">Note</label><input className="input" value={payForm.note} onChange={e => setPayForm({...payForm, note: e.target.value})} /></div>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setShowPayModal(false)}>Cancel</button>
              <button className="btn-primary">Record</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
