import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const quickLogin = (e, p) => { setEmail(e); setPassword(p); };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-2">🏫</div>
            <h1 className="text-2xl font-bold text-slate-800">SchoolHub</h1>
            <p className="text-slate-500 text-sm mt-1">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button className="btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-slate-500 mb-3 text-center">Quick Demo Login:</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['Admin','admin@school.com','admin123'],
                ['Teacher','teacher@school.com','teacher123'],
                ['Student','student@school.com','student123'],
                ['Guardian','parent@school.com','parent123'],
                ['Accounts','accounts@school.com','accounts123'],
              ].map(([label, e, p]) => (
                <button key={label} type="button" onClick={() => quickLogin(e, p)}
                  className="btn-secondary btn-sm text-xs">{label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
