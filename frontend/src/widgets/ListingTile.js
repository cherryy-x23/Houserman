import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useSession } from '../store/SessionContext';
import { wishlistService } from '../services/api';
import { formatCost, getListingImage } from '../services/helpers';
import { FiMapPin, FiHeart, FiEye } from 'react-icons/fi';
import { MdOutlineBed, MdOutlineBathtub, MdOutlineSquareFoot, MdWifi, MdLocalParking, MdAcUnit } from 'react-icons/md';
import { toast } from 'react-toastify';

export default function ListingTile({ listing }) {
  const { account } = useSession();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const isTaken = listing.occupancyState === 'Taken';

  const handleSave = async (e) => {
    e.preventDefault();
    if (!account) { toast.error('Sign in to save homes'); return; }
    if (account.accountType !== 'seeker') { toast.error('Only seekers can save homes'); return; }
    setBusy(true);
    try {
      const res = await wishlistService.toggle(listing._id);
      setSaved(res.data.listed);
      toast.success(res.data.listed ? 'Saved to your list' : 'Removed from your list');
    } catch {
      toast.error('Could not update');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Link to={`/find-a-home/${listing._id}`}>
      <div className="hr-card" style={{ opacity: isTaken ? 0.82 : 1 }}>
        <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
          <img src={getListingImage(listing)} alt={listing.heading}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
            <span className={`hr-badge ${isTaken ? 'taken' : 'open'}`}>
              {isTaken ? 'Taken' : 'Open'}
            </span>
            <span className="hr-badge" style={{ background: 'rgba(255,255,255,0.92)', color: 'var(--ink)' }}>
              {listing.category}
            </span>
          </div>
          {account?.accountType === 'seeker' && (
            <button onClick={handleSave} disabled={busy}
              style={{
                position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: '50%',
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: saved ? 'var(--coral)' : 'rgba(255,255,255,0.9)',
                color: saved ? 'white' : 'var(--ink-soft)',
              }}>
              <FiHeart fill={saved ? 'white' : 'none'} size={15} />
            </button>
          )}
          <div style={{
            position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.45)', color: 'white',
            fontSize: 11, borderRadius: 999, padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <FiEye size={11} /> {listing.hitCount || 0}
          </div>
        </div>

        <div style={{ padding: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{listing.heading}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, color: 'var(--ink-soft)', fontSize: 13 }}>
            <FiMapPin size={12} />
            <span>{listing.locationInfo?.area ? `${listing.locationInfo.area}, ` : ''}{listing.locationInfo?.town}</span>
          </div>

          <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 13, color: 'var(--ink-soft)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MdOutlineBed /> {listing.bedroomCount}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MdOutlineBathtub /> {listing.bathroomCount}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MdOutlineSquareFoot /> {listing.floorArea} sqft</span>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            {listing.facilities?.internet && <MdWifi style={{ color: 'var(--brand)' }} />}
            {listing.facilities?.vehicleParking && <MdLocalParking style={{ color: 'var(--brand)' }} />}
            {listing.facilities?.airConditioned && <MdAcUnit style={{ color: 'var(--brand)' }} />}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
            <div>
              <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--brand-dark)' }}>{formatCost(listing.monthlyCost)}</span>
              <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>/month</span>
            </div>
            {isTaken && <span style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 600 }}>Unavailable</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
