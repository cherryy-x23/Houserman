import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { listingService } from '../services/api';
import ListingTile from '../widgets/ListingTile';
import { FiSearch, FiShield, FiMessageSquare, FiZap } from 'react-icons/fi';

export default function HomeView() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listingService.fetchAll({ count: 6, order: '-hitCount' })
      .then((res) => setFeatured(res.data.listings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%)',
        borderRadius: 18, padding: '54px 30px', color: 'white', textAlign: 'center', marginBottom: 36,
      }}>
        <h1 style={{ fontSize: 32, margin: '0 0 10px', fontWeight: 800 }}>Find a place to call home</h1>
        <p style={{ fontSize: 15, opacity: 0.9, margin: '0 0 24px' }}>Browse verified rental listings, chat with owners, and move in faster.</p>
        <Link to="/find-a-home" className="hr-pill-btn" style={{ background: 'white', color: 'var(--brand-dark)', padding: '12px 28px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <FiSearch /> Browse Listings
        </Link>
      </div>

      {/* Features */}
      <div className="hr-grid" style={{ marginBottom: 40, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {[
          { icon: <FiShield />, t: 'Manager Cleared', d: 'Every listing is reviewed before going live' },
          { icon: <FiMessageSquare />, t: 'Direct Chat', d: 'Talk to owners instantly, no middlemen' },
          { icon: <FiZap />, t: 'Fast Process', d: 'Send a stay request and move in within days' },
        ].map((f, i) => (
          <div key={i} className="hr-panel" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 26, color: 'var(--brand)', marginBottom: 10 }}>{f.icon}</div>
            <h3 style={{ margin: '0 0 6px', fontSize: 15 }}>{f.t}</h3>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-soft)' }}>{f.d}</p>
          </div>
        ))}
      </div>

      {/* Featured listings */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>Popular Listings</h2>
        <Link to="/find-a-home" style={{ color: 'var(--brand)', fontWeight: 600, fontSize: 14 }}>View all →</Link>
      </div>

      {loading ? (
        <div className="hr-grid">
          {[1, 2, 3].map((i) => <div key={i} className="hr-skeleton" style={{ height: 280 }} />)}
        </div>
      ) : (
        <div className="hr-grid">
          {featured.map((l) => <ListingTile key={l._id} listing={l} />)}
        </div>
      )}
    </div>
  );
}
