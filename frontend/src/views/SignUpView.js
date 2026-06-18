import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { identityService } from '../services/api';
import { toast } from 'react-toastify';
import { FiHome } from 'react-icons/fi';

export default function SignUpView() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '', emailAddress: '', passwordHash: '', contactNumber: '', accountType: 'seeker',
  });
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await identityService.signup(form);
      toast.success('Account created! Please sign in.');
      navigate('/sign-in');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Sign up failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 460, margin: '40px auto' }}>
      <div className="hr-panel">
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <span className="hr-brand-mark" style={{ display: 'inline-flex', marginBottom: 10 }}><FiHome /></span>
          <h2 style={{ margin: '6px 0 0', color: 'var(--brand-dark)' }}>HouseRman</h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>Create your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label className="hr-label">Full Name</label>
            <input className="hr-field" required value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="hr-label">Email Address</label>
            <input className="hr-field" type="email" required value={form.emailAddress}
              onChange={(e) => setForm({ ...form, emailAddress: e.target.value })} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="hr-label">Contact Number <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}>(optional)</span></label>
            <input className="hr-field" value={form.contactNumber}
              placeholder="10-digit number"
              onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="hr-label">Passcode</label>
            <input className="hr-field" type="password" required value={form.passwordHash}
              onChange={(e) => setForm({ ...form, passwordHash: e.target.value })} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className="hr-label">I am a</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {[{ v: 'seeker', l: 'Home Seeker' }, { v: 'owner', l: 'Home Owner' }].map(({ v, l }) => (
                <button key={v} type="button" onClick={() => setForm({ ...form, accountType: v })}
                  style={{
                    flex: 1, padding: 12, borderRadius: 10, fontWeight: 600, fontSize: 13,
                    border: form.accountType === v ? '2px solid var(--brand)' : '1.5px solid var(--line)',
                    background: form.accountType === v ? 'var(--brand-soft)' : 'white',
                    color: form.accountType === v ? 'var(--brand-dark)' : 'var(--ink-soft)',
                  }}>{l}</button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={busy} className="hr-pill-btn primary" style={{ width: '100%', padding: 12 }}>
            {busy ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--ink-soft)' }}>
          Already have an account? <Link to="/sign-in" style={{ color: 'var(--brand)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
