import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { identityService } from '../services/api';
import { useSession } from '../store/SessionContext';
import { toast } from 'react-toastify';
import { FiHome } from 'react-icons/fi';

export default function SignInView() {
  const navigate = useNavigate();
  const { signInSession } = useSession();
  const [form, setForm] = useState({ emailAddress: '', passwordHash: '' });
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await identityService.signin(form);
      signInSession(res.data.token, res.data.account);
      toast.success('Signed in successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Sign in failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto' }}>
      <div className="hr-panel">
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <span className="hr-brand-mark" style={{ display: 'inline-flex', marginBottom: 10 }}><FiHome /></span>
          <h2 style={{ margin: '6px 0 0', color: 'var(--brand-dark)' }}>HouseRman</h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label className="hr-label">Email Address</label>
            <input className="hr-field" type="email" required
              value={form.emailAddress}
              onChange={(e) => setForm({ ...form, emailAddress: e.target.value })} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label className="hr-label">Passcode</label>
            <input className="hr-field" type="password" required
              value={form.passwordHash}
              onChange={(e) => setForm({ ...form, passwordHash: e.target.value })} />
          </div>
          <button type="submit" disabled={busy} className="hr-pill-btn primary" style={{ width: '100%', padding: 12 }}>
            {busy ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 14, textAlign: 'center' }}>
          <Link to="/forgot-passcode" style={{ fontSize: 13, color: 'var(--brand)' }}>Forgot passcode?</Link>
        </div>

        <div style={{ marginTop: 18, padding: 14, background: 'var(--paper)', borderRadius: 10 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', margin: '0 0 8px' }}>Demo Accounts (passcode: Passcode123)</p>
          {[
            { label: 'Manager', email: 'manager@houserman.com' },
            { label: 'Owner', email: 'owner1@houserman.com' },
            { label: 'Seeker', email: 'seeker1@houserman.com' },
          ].map(({ label, email }) => (
            <button key={label} type="button"
              onClick={() => setForm({ emailAddress: email, passwordHash: 'Passcode123' })}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '5px 0', fontSize: 12 }}>
              <strong style={{ color: 'var(--brand)' }}>{label}:</strong> <span style={{ color: 'var(--ink-soft)' }}>{email}</span>
            </button>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--ink-soft)' }}>
          New here? <Link to="/sign-up" style={{ color: 'var(--brand)', fontWeight: 600 }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
}
