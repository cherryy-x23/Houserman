import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { listingService, stayService, petitionService } from '../services/api';
import { useSession } from '../store/SessionContext';
import { formatCost, formatWhen, getListingImage, buildThreadTag } from '../services/helpers';
import { toast } from 'react-toastify';
import {
  FiMapPin, FiHeart, FiMessageSquare, FiEdit, FiTrash2, FiArrowLeft,
} from 'react-icons/fi';
import { MdOutlineBed, MdOutlineBathtub, MdOutlineSquareFoot, MdWifi, MdLocalParking, MdAcUnit, MdPower, MdSecurity, MdFitnessCenter, MdPool } from 'react-icons/md';

const FACILITY_ICONS = {
  internet: { icon: MdWifi, label: 'Internet' },
  vehicleParking: { icon: MdLocalParking, label: 'Vehicle Parking' },
  generatorBackup: { icon: MdPower, label: 'Generator Backup' },
  waterSupply24x7: { icon: MdWifi, label: '24x7 Water' },
  airConditioned: { icon: MdAcUnit, label: 'Air Conditioned' },
  guardSecurity: { icon: MdSecurity, label: 'Guard Security' },
  fitnessCenter: { icon: MdFitnessCenter, label: 'Fitness Center' },
  swimPool: { icon: MdPool, label: 'Swimming Pool' },
};

export default function ListingDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account } = useSession();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStayForm, setShowStayForm] = useState(false);
  const [stayForm, setStayForm] = useState({ moveInOn: '', moveOutOn: '', noteToOwner: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listingService.fetchOne(id)
      .then((res) => setListing(res.data.listing))
      .catch(() => toast.error('Listing not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStaySubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await stayService.create(id, stayForm);
      toast.success('Stay request sent!');
      setShowStayForm(false);
      navigate('/my-console');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to send stay request');
    } finally { setBusy(false); }
  };

  const handlePetition = async () => {
    setBusy(true);
    try {
      await petitionService.create(id, { note: 'I am interested in this home.' });
      toast.success('Petition sent to owner!');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to send petition');
    } finally { setBusy(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Remove this listing permanently?')) return;
    try {
      await listingService.remove(id);
      toast.success('Listing removed');
      navigate('/my-console');
    } catch { toast.error('Failed to remove listing'); }
  };

  const goToChat = () => {
    const tag = buildThreadTag(account._id, listing.ownerRef._id, listing._id);
    navigate(`/conversations/${tag}`);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="hr-spin" /></div>;
  if (!listing) return null;

  const isOwner = account?._id === listing.ownerRef?._id || account?.accountType === 'manager';
  const isOpen = listing.occupancyState === 'Open';

  return (
    <div>
      <button onClick={() => navigate(-1)} className="hr-pill-btn ghost" style={{ marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <FiArrowLeft /> Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24 }}>
        {/* Left column */}
        <div>
          <img src={getListingImage(listing)} alt={listing.heading}
            style={{ width: '100%', height: 360, objectFit: 'cover', borderRadius: 14 }} />

          <div className="hr-panel" style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ margin: '0 0 6px', fontSize: 24 }}>{listing.heading}</h1>
                <p style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-soft)', margin: 0 }}>
                  <FiMapPin /> {listing.locationInfo?.addressLine}, {listing.locationInfo?.area}, {listing.locationInfo?.town}
                </p>
              </div>
              <span className={`hr-badge ${isOpen ? 'open' : 'taken'}`}>{isOpen ? 'Open' : 'Taken'}</span>
            </div>

            <div style={{ display: 'flex', gap: 22, marginTop: 18, padding: '14px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MdOutlineBed /> {listing.bedroomCount} Bedrooms</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MdOutlineBathtub /> {listing.bathroomCount} Bathrooms</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MdOutlineSquareFoot /> {listing.floorArea} sqft</span>
            </div>

            <h3 style={{ marginTop: 20 }}>About this place</h3>
            <p style={{ color: 'var(--ink-soft)', lineHeight: 1.6 }}>{listing.summary}</p>

            <h3>Facilities</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
              {Object.entries(listing.facilities || {}).filter(([, v]) => v).map(([key]) => {
                const meta = FACILITY_ICONS[key];
                if (!meta) return null;
                const Icon = meta.icon;
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, background: 'var(--paper)', borderRadius: 10, fontSize: 13 }}>
                    <Icon style={{ color: 'var(--brand)' }} /> {meta.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div>
          <div className="hr-panel" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--brand-dark)' }}>{formatCost(listing.monthlyCost)}<span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-soft)' }}>/month</span></div>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Advance: {formatCost(listing.advanceAmount)}</p>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Ready from: {formatWhen(listing.readyFrom)}</p>
          </div>

          <div className="hr-panel" style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '0 0 4px' }}>Listed by</p>
            <p style={{ fontWeight: 700, margin: 0 }}>{listing.ownerRef?.fullName}</p>
          </div>

          {/* Seeker actions */}
          {account?.accountType === 'seeker' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {isOpen && !showStayForm && (
                <button onClick={() => setShowStayForm(true)} className="hr-pill-btn primary" style={{ padding: 13 }}>
                  Request to Stay
                </button>
              )}
              {showStayForm && (
                <form onSubmit={handleStaySubmit} className="hr-panel">
                  <label className="hr-label">Move in</label>
                  <input className="hr-field" type="date" required style={{ marginBottom: 10 }}
                    value={stayForm.moveInOn} onChange={(e) => setStayForm({ ...stayForm, moveInOn: e.target.value })} />
                  <label className="hr-label">Move out</label>
                  <input className="hr-field" type="date" required style={{ marginBottom: 10 }}
                    value={stayForm.moveOutOn} onChange={(e) => setStayForm({ ...stayForm, moveOutOn: e.target.value })} />
                  <label className="hr-label">Note to owner</label>
                  <textarea className="hr-field" rows={3} style={{ marginBottom: 12 }}
                    value={stayForm.noteToOwner} onChange={(e) => setStayForm({ ...stayForm, noteToOwner: e.target.value })} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={() => setShowStayForm(false)} className="hr-pill-btn ghost" style={{ flex: 1 }}>Cancel</button>
                    <button type="submit" disabled={busy} className="hr-pill-btn primary" style={{ flex: 1 }}>Submit</button>
                  </div>
                </form>
              )}
              {isOpen && (
                <button onClick={handlePetition} disabled={busy} className="hr-pill-btn ghost" style={{ padding: 13 }}>
                  Send a Petition
                </button>
              )}
              <button onClick={goToChat} className="hr-pill-btn coral" style={{ padding: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <FiMessageSquare /> Message Owner
              </button>
            </div>
          )}

          {/* Owner actions */}
          {isOwner && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to={`/list-a-home/${id}/revise`} className="hr-pill-btn primary" style={{ padding: 13, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <FiEdit /> Revise Listing
              </Link>
              <button onClick={handleDelete} className="hr-pill-btn danger" style={{ padding: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <FiTrash2 /> Remove Listing
              </button>
              <div className={`hr-badge ${listing.moderationState === 'Cleared' ? 'cleared' : listing.moderationState === 'Declined' ? 'declined' : 'awaiting'}`} style={{ textAlign: 'center', padding: '8px 0', justifyContent: 'center' }}>
                Moderation: {listing.moderationState}
              </div>
            </div>
          )}

          {!account && (
            <Link to="/sign-in" className="hr-pill-btn primary" style={{ padding: 13, textAlign: 'center', display: 'block' }}>
              Sign in to contact owner
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
