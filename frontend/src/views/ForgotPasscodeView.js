import { useState } from 'react';
import { Link } from 'react-router-dom';
import { identityService } from '../services/api';
import { toast } from 'react-toastify';

export default function ForgotPasscodeView() {
  const [emailAddress, setEmailAddress] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await identityService.forgotPasscode({ emailAddress });
      setSent(true);
      toast.success('Reset link sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to send reset link');
    } finally { setBusy(false); }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <div className="hr-panel">
        <h2 style={{ marginTop: 0, color: 'var(--brand-dark)' }}>Forgot Passcode</h2>
        {sent ? (
          <p style={{ color: 'var(--ink-soft)' }}>Check your email for a reset link.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="hr-label">Email Address</label>
            <input className="hr-field" type="email" required style={{ marginBottom: 16 }}
              value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} />
            <button type="submit" disabled={busy} className="hr-pill-btn primary" style={{ width: '100%', padding: 12 }}>
              {busy ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
          <Link to="/sign-in" style={{ color: 'var(--brand)' }}>Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
