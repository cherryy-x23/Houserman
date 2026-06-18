import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { identityService } from '../services/api';
import { useSession } from '../store/SessionContext';
import { toast } from 'react-toastify';

export default function ResetPasscodeView() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { signInSession } = useSession();
  const [passwordHash, setPasswordHash] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await identityService.resetPasscode(code, { passwordHash });
      signInSession(res.data.token, res.data.account);
      toast.success('Passcode reset successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Reset failed, link may be expired');
    } finally { setBusy(false); }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <div className="hr-panel">
        <h2 style={{ marginTop: 0, color: 'var(--brand-dark)' }}>Reset Passcode</h2>
        <form onSubmit={handleSubmit}>
          <label className="hr-label">New Passcode</label>
          <input className="hr-field" type="password" required style={{ marginBottom: 16 }}
            value={passwordHash} onChange={(e) => setPasswordHash(e.target.value)} />
          <button type="submit" disabled={busy} className="hr-pill-btn primary" style={{ width: '100%', padding: 12 }}>
            {busy ? 'Resetting...' : 'Reset Passcode'}
          </button>
        </form>
      </div>
    </div>
  );
}
