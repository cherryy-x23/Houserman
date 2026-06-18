import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSession } from '../store/SessionContext';
import { accountService, stayService, petitionService } from '../services/api';
import { formatCost, formatWhen, getListingImage } from '../services/helpers';
import { toast } from 'react-toastify';

export default function MyConsoleView() {
  const { account } = useSession();
  const isOwner = account?.accountType === 'owner';
  const [figures, setFigures] = useState(null);
  const [petitions, setPetitions] = useState([]);
  const [listings, setListings] = useState([]);
  const [stays, setStays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    const loadFn = isOwner ? accountService.ownerConsole : accountService.seekerConsole;
    loadFn().then((res) => {
      setFigures(res.data.figures);
      if (isOwner) { setListings(res.data.listings); setPetitions(res.data.petitions); }
      else { setPetitions(res.data.petitions); }
    }).catch(() => {}).finally(() => setLoading(false));

    const stayFn = isOwner ? stayService.fetchOwner : stayService.fetchMy;
    stayFn().then((res) => setStays(res.data.stays)).catch(() => {});
  }, [isOwner]);

  const handlePetitionState = async (petId, petitionState) => {
    try {
      await petitionService.changeState(petId, { petitionState });
      setPetitions((prev) => prev.map((p) => p._id === petId ? { ...p, petitionState } : p));
      toast.success(`Petition ${petitionState.toLowerCase()}`);
    } catch { toast.error('Action failed'); }
  };

  const handleStayState = async (stayId, stayState) => {
    try {
      await stayService.changeState(stayId, { stayState });
      setStays((prev) => prev.map((s) => s._id === stayId ? { ...s, stayState } : s));
      toast.success(`Stay ${stayState.toLowerCase()}`);
    } catch { toast.error('Action failed'); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="hr-spin" /></div>;

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 18 }}>{isOwner ? 'Owner Console' : 'Seeker Console'}</h1>

      {/* Stats */}
      <div className="hr-grid" style={{ marginBottom: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
        {isOwner ? (
          <>
            <StatBlock label="Listings" value={figures?.totalListings} />
            <StatBlock label="Open" value={figures?.openListings} />
            <StatBlock label="Taken" value={figures?.takenListings} />
            <StatBlock label="Petitions" value={figures?.totalPetitions} />
          </>
        ) : (
          <>
            <StatBlock label="Petitions Sent" value={figures?.totalPetitions} />
            <StatBlock label="Awaiting" value={figures?.awaitingPetitions} />
            <StatBlock label="Accepted" value={figures?.acceptedPetitions} />
            <StatBlock label="Saved Homes" value={figures?.savedListings} />
          </>
        )}
      </div>

      <div className="hr-tabs">
        <button className={`hr-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Petitions</button>
        <button className={`hr-tab ${tab === 'stays' ? 'active' : ''}`} onClick={() => setTab('stays')}>Stays</button>
        {isOwner && <button className={`hr-tab ${tab === 'listings' ? 'active' : ''}`} onClick={() => setTab('listings')}>My Listings</button>}
      </div>

      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {petitions.length === 0 ? <div className="hr-empty">No petitions yet</div> : petitions.map((p) => (
            <div key={p._id} className="hr-panel" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <img src={getListingImage(p.listingRef)} alt="" style={{ width: 70, height: 70, borderRadius: 10, objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700 }}>{p.listingRef?.heading}</p>
                <p style={{ margin: '3px 0', fontSize: 13, color: 'var(--ink-soft)' }}>
                  {isOwner ? `From: ${p.seekerRef?.fullName}` : `Owner: ${p.ownerRef?.fullName}`}
                </p>
                <span className={`hr-badge ${p.petitionState.toLowerCase()}`}>{p.petitionState}</span>
              </div>
              {isOwner && p.petitionState === 'Awaiting' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handlePetitionState(p._id, 'Accepted')} className="hr-pill-btn primary">Accept</button>
                  <button onClick={() => handlePetitionState(p._id, 'Declined')} className="hr-pill-btn danger">Decline</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'stays' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {stays.length === 0 ? <div className="hr-empty">No stay requests yet</div> : stays.map((s) => (
            <div key={s._id} className="hr-panel" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <img src={getListingImage(s.listingRef)} alt="" style={{ width: 70, height: 70, borderRadius: 10, objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700 }}>{s.listingRef?.heading}</p>
                <p style={{ margin: '3px 0', fontSize: 13, color: 'var(--ink-soft)' }}>
                  {formatWhen(s.moveInOn)} - {formatWhen(s.moveOutOn)} • {formatCost(s.payableAmount)}
                </p>
                <span className={`hr-badge ${s.stayState.toLowerCase()}`}>{s.stayState}</span>
              </div>
              {isOwner && s.stayState === 'Awaiting' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleStayState(s._id, 'Accepted')} className="hr-pill-btn primary">Accept</button>
                  <button onClick={() => handleStayState(s._id, 'Declined')} className="hr-pill-btn danger">Decline</button>
                </div>
              )}
              {isOwner && s.stayState === 'Accepted' && (
                <button onClick={() => handleStayState(s._id, 'Closed')} className="hr-pill-btn ghost">Mark Closed</button>
              )}
              {!isOwner && ['Awaiting', 'Accepted'].includes(s.stayState) && (
                <button onClick={() => handleStayState(s._id, 'Closed')} className="hr-pill-btn danger">Cancel</button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'listings' && isOwner && (
        <div className="hr-grid">
          {listings.length === 0 ? <div className="hr-empty">No listings yet. <Link to="/list-a-home">List one now</Link></div> : listings.map((l) => (
            <Link key={l._id} to={`/find-a-home/${l._id}`} className="hr-card" style={{ display: 'block' }}>
              <img src={getListingImage(l)} alt="" style={{ width: '100%', height: 140, objectFit: 'cover' }} />
              <div style={{ padding: 14 }}>
                <p style={{ margin: 0, fontWeight: 700 }}>{l.heading}</p>
                <p style={{ margin: '4px 0', fontSize: 13, color: 'var(--brand-dark)', fontWeight: 700 }}>{formatCost(l.monthlyCost)}/mo</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className={`hr-badge ${l.occupancyState.toLowerCase()}`}>{l.occupancyState}</span>
                  <span className={`hr-badge ${l.moderationState.toLowerCase()}`}>{l.moderationState}</span>
                </div>
              </div>
            </Link>
          ))}
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
