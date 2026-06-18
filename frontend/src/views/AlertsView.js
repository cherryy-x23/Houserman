import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { alertService } from '../services/api';
import { timeSince } from '../services/helpers';
import { toast } from 'react-toastify';

export default function AlertsView() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    alertService.fetchAll().then((res) => setAlerts(res.data.alerts)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleClearAll = async () => {
    try {
      await alertService.clearAll();
      setAlerts((prev) => prev.map((a) => ({ ...a, seen: true })));
      toast.success('All alerts cleared');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="hr-spin" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>Alerts</h1>
        <button onClick={handleClearAll} className="hr-pill-btn ghost">Mark all read</button>
      </div>

      {alerts.length === 0 ? (
        <div className="hr-empty"><h3>No alerts yet</h3></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {alerts.map((a) => (
            <Link key={a._id} to={a.targetLink || '#'} className="hr-panel" style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: a.seen ? 'var(--panel)' : 'var(--brand-soft)',
            }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{a.heading}</p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-soft)' }}>{a.body}</p>
              </div>
              <span style={{ fontSize: 11, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>{timeSince(a.createdAt)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
