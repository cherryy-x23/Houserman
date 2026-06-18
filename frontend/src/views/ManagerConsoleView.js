import { useEffect, useState } from 'react';
import { managerService } from '../services/api';
import { formatCost, getListingImage } from '../services/helpers';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function ManagerConsoleView() {
  const [tab, setTab] = useState('overview');
  const [figures, setFigures] = useState(null);
  const [pending, setPending] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState({});

  useEffect(() => {
    managerService.figures().then((res) => setFigures(res.data.figures)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === 'approvals') {
      managerService.pendingListings().then((res) => setPending(res.data.listings)).catch(() => {});
    }
    if (tab === 'accounts') {
      managerService.accounts().then((res) => setAccounts(res.data.accounts)).catch(() => {});
    }
  }, [tab]);

  const handleModerate = async (id, moderationState) => {
    try {
      await managerService.moderateListing(id, { moderationState, moderationNote: note[id] || '' });
      setPending((prev) => prev.filter((p) => p._id !== id));
      toast.success(`Listing ${moderationState.toLowerCase()}`);
    } catch { toast.error('Action failed'); }
  };

  const handleSuspend = async (id) => {
    try {
      const res = await managerService.toggleSuspend(id);
      setAccounts((prev) => prev.map((a) => a._id === id ? { ...a, suspended: !a.suspended } : a));
      toast.success(res.data.msg);
    } catch { toast.error('Action failed'); }
  };

  const monthlyData = figures?.monthlyAccounts?.map((m) => ({ month: MONTHS[m._id - 1], count: m.count })) || [];

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="hr-spin" /></div>;

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 18 }}>Manager Console</h1>

      <div className="hr-tabs">
        <button className={`hr-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
        <button className={`hr-tab ${tab === 'approvals' ? 'active' : ''}`} onClick={() => setTab('approvals')}>Listing Approvals</button>
        <button className={`hr-tab ${tab === 'accounts' ? 'active' : ''}`} onClick={() => setTab('accounts')}>Manage Accounts</button>
      </div>

      {tab === 'overview' && (
        <>
          <div className="hr-grid" style={{ marginBottom: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
            <StatBlock label="Total Accounts" value={figures?.accounts.total} />
            <StatBlock label="Seekers" value={figures?.accounts.seekers} />
            <StatBlock label="Owners" value={figures?.accounts.owners} />
            <StatBlock label="Total Listings" value={figures?.listings.total} />
            <StatBlock label="Open Listings" value={figures?.listings.open} />
            <StatBlock label="Total Petitions" value={figures?.totalPetitions} />
          </div>
          <div className="hr-panel">
            <h3>Monthly Account Growth</h3>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1f8a70" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p style={{ color: 'var(--ink-soft)', textAlign: 'center', padding: 30 }}>No data yet</p>}
          </div>
        </>
      )}

      {tab === 'approvals' && (
        <div className="hr-grid">
          {pending.length === 0 ? (
            <div className="hr-empty"><h3>No pending listings</h3><p>All listings have been reviewed</p></div>
          ) : pending.map((p) => (
            <div key={p._id} className="hr-card">
              <img src={getListingImage(p)} alt="" style={{ width: '100%', height: 150, objectFit: 'cover' }} />
              <div style={{ padding: 14 }}>
                <p style={{ margin: 0, fontWeight: 700 }}>{p.heading}</p>
                <p style={{ margin: '4px 0', fontSize: 13, color: 'var(--ink-soft)' }}>{p.locationInfo?.town} • {p.category}</p>
                <p style={{ margin: '4px 0', fontWeight: 700, color: 'var(--brand-dark)' }}>{formatCost(p.monthlyCost)}/mo</p>
                <p style={{ fontSize: 11, color: 'var(--ink-soft)' }}>By: {p.ownerRef?.fullName} ({p.ownerRef?.emailAddress})</p>
                <input className="hr-field" placeholder="Note for owner (optional)" style={{ marginBottom: 10, fontSize: 12 }}
                  value={note[p._id] || ''} onChange={(e) => setNote((prev) => ({ ...prev, [p._id]: e.target.value }))} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleModerate(p._id, 'Cleared')} className="hr-pill-btn primary" style={{ flex: 1 }}>Clear</button>
                  <button onClick={() => handleModerate(p._id, 'Declined')} className="hr-pill-btn danger" style={{ flex: 1 }}>Decline</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'accounts' && (
        <div className="hr-panel" style={{ padding: 0, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--paper)' }}>
                {['Name', 'Email', 'Type', 'Status', 'Action'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: 12, fontSize: 12, color: 'var(--ink-soft)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a._id} style={{ borderTop: '1px solid var(--line)' }}>
                  <td style={{ padding: 12, fontWeight: 600, fontSize: 13 }}>{a.fullName}</td>
                  <td style={{ padding: 12, fontSize: 13, color: 'var(--ink-soft)' }}>{a.emailAddress}</td>
                  <td style={{ padding: 12 }}><span className="hr-badge open">{a.accountType}</span></td>
                  <td style={{ padding: 12 }}><span className={`hr-badge ${a.suspended ? 'taken' : 'open'}`}>{a.suspended ? 'Suspended' : 'Active'}</span></td>
                  <td style={{ padding: 12 }}>
                    {a.accountType !== 'manager' && (
                      <button onClick={() => handleSuspend(a._id)} className="hr-pill-btn ghost" style={{ fontSize: 12, padding: '6px 12px' }}>
                        {a.suspended ? 'Reinstate' : 'Suspend'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatBlock({ label, value }) {
  return (
    <div className="hr-panel" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--brand-dark)' }}>{value ?? 0}</div>
      <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{label}</div>
    </div>
  );
}
