import { useState } from 'react';
import { useSession } from '../store/SessionContext';
import { accountService } from '../services/api';
import { toast } from 'react-toastify';

export default function ProfileView() {
  const { account, patchAccount } = useSession();
  const [form, setForm] = useState({
    fullName: account?.fullName || '', contactNumber: account?.contactNumber || '', aboutMe: account?.aboutMe || '',
  });
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      const res = await accountService.editProfile(fd);
      patchAccount(res.data.account);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, marginBottom: 18 }}>My Profile</h1>
      <form onSubmit={handleSubmit} className="hr-panel">
        <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'var(--brand-soft)', color: 'var(--brand-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, margin: '0 auto 20px' }}>
          {account?.fullName?.[0]?.toUpperCase()}
        </div>

        <label className="hr-label">Full Name</label>
        <input className="hr-field" style={{ marginBottom: 14 }} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />

        <label className="hr-label">Email</label>
        <input className="hr-field" style={{ marginBottom: 14, background: '#eee' }} value={account?.emailAddress} disabled />

        <label className="hr-label">Contact Number</label>
        <input className="hr-field" style={{ marginBottom: 14 }} value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} />

        <label className="hr-label">About Me</label>
        <textarea className="hr-field" rows={3} style={{ marginBottom: 18 }} value={form.aboutMe} onChange={(e) => setForm({ ...form, aboutMe: e.target.value })} />

        <button type="submit" disabled={busy} className="hr-pill-btn primary" style={{ width: '100%', padding: 12 }}>
          {busy ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
