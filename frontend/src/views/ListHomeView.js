import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { listingService } from '../services/api';
import { toast } from 'react-toastify';

const CATEGORIES = ['Flat', 'Independent House', 'Bungalow', 'Single Room'];
const FURNISH = ['Fully Furnished', 'Partly Furnished', 'Not Furnished'];
const FACILITY_KEYS = [
  ['internet', 'Internet'], ['vehicleParking', 'Vehicle Parking'], ['generatorBackup', 'Generator Backup'],
  ['waterSupply24x7', '24x7 Water'], ['airConditioned', 'Air Conditioned'], ['guardSecurity', 'Guard Security'],
  ['fitnessCenter', 'Fitness Center'], ['swimPool', 'Swimming Pool'],
];

export default function ListHomeView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isRevise = window.location.pathname.includes('revise');
  const [form, setForm] = useState({
    heading: '', summary: '', category: 'Flat', monthlyCost: '', advanceAmount: '',
    bedroomCount: '', bathroomCount: '', floorArea: '', furnishLevel: 'Fully Furnished', readyFrom: '',
    addressLine: '', area: '', town: '', region: '', pin: '',
    facilities: {},
  });
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isRevise && id) {
      listingService.fetchOne(id).then((res) => {
        const l = res.data.listing;
        setForm({
          heading: l.heading, summary: l.summary, category: l.category,
          monthlyCost: l.monthlyCost, advanceAmount: l.advanceAmount,
          bedroomCount: l.bedroomCount, bathroomCount: l.bathroomCount, floorArea: l.floorArea,
          furnishLevel: l.furnishLevel, readyFrom: l.readyFrom?.split('T')[0],
          addressLine: l.locationInfo?.addressLine, area: l.locationInfo?.area,
          town: l.locationInfo?.town, region: l.locationInfo?.region, pin: l.locationInfo?.pin,
          facilities: l.facilities || {},
        });
      });
    }
  }, [isRevise, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const fd = new FormData();
      ['heading', 'summary', 'category', 'monthlyCost', 'advanceAmount', 'bedroomCount', 'bathroomCount', 'floorArea', 'furnishLevel', 'readyFrom']
        .forEach((k) => fd.append(k, form[k]));
      fd.append('locationInfo', JSON.stringify({ addressLine: form.addressLine, area: form.area, town: form.town, region: form.region, pin: form.pin }));
      fd.append('facilities', JSON.stringify(form.facilities));
      files.forEach((f) => fd.append('houseImages', f));

      if (isRevise) {
        await listingService.revise(id, fd);
        toast.success('Listing updated!');
      } else {
        await listingService.create(fd);
        toast.success('Listing submitted! Waiting for manager approval.');
      }
      navigate('/my-console');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to save listing');
    } finally { setBusy(false); }
  };

  const toggleFacility = (key) => setForm({ ...form, facilities: { ...form.facilities, [key]: !form.facilities[key] } });

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, marginBottom: 18 }}>{isRevise ? 'Revise Listing' : 'List a New Home'}</h1>
      <form onSubmit={handleSubmit} className="hr-panel">
        <label className="hr-label">Heading</label>
        <input className="hr-field" required style={{ marginBottom: 14 }}
          value={form.heading} onChange={(e) => setForm({ ...form, heading: e.target.value })} />

        <label className="hr-label">Summary</label>
        <textarea className="hr-field" rows={3} required style={{ marginBottom: 14 }}
          value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <label className="hr-label">Category</label>
            <select className="hr-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="hr-label">Furnish Level</label>
            <select className="hr-field" value={form.furnishLevel} onChange={(e) => setForm({ ...form, furnishLevel: e.target.value })}>
              {FURNISH.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 14 }}>
          <div><label className="hr-label">Monthly Cost</label><input className="hr-field" type="number" required value={form.monthlyCost} onChange={(e) => setForm({ ...form, monthlyCost: e.target.value })} /></div>
          <div><label className="hr-label">Advance Amount</label><input className="hr-field" type="number" value={form.advanceAmount} onChange={(e) => setForm({ ...form, advanceAmount: e.target.value })} /></div>
          <div><label className="hr-label">Bedrooms</label><input className="hr-field" type="number" required value={form.bedroomCount} onChange={(e) => setForm({ ...form, bedroomCount: e.target.value })} /></div>
          <div><label className="hr-label">Bathrooms</label><input className="hr-field" type="number" required value={form.bathroomCount} onChange={(e) => setForm({ ...form, bathroomCount: e.target.value })} /></div>
          <div><label className="hr-label">Floor Area (sqft)</label><input className="hr-field" type="number" required value={form.floorArea} onChange={(e) => setForm({ ...form, floorArea: e.target.value })} /></div>
          <div><label className="hr-label">Ready From</label><input className="hr-field" type="date" required value={form.readyFrom} onChange={(e) => setForm({ ...form, readyFrom: e.target.value })} /></div>
        </div>

        <h3>Location</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}><label className="hr-label">Address Line</label><input className="hr-field" required value={form.addressLine} onChange={(e) => setForm({ ...form, addressLine: e.target.value })} /></div>
          <div><label className="hr-label">Area / Locality</label><input className="hr-field" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} /></div>
          <div><label className="hr-label">Town / City</label><input className="hr-field" required value={form.town} onChange={(e) => setForm({ ...form, town: e.target.value })} /></div>
          <div><label className="hr-label">Region / State</label><input className="hr-field" required value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} /></div>
          <div><label className="hr-label">Pin Code</label><input className="hr-field" required value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value })} /></div>
        </div>

        <h3>Facilities</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 18 }}>
          {FACILITY_KEYS.map(([key, label]) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: 10, background: 'var(--paper)', borderRadius: 10 }}>
              <input type="checkbox" checked={!!form.facilities[key]} onChange={() => toggleFacility(key)} />
              {label}
            </label>
          ))}
        </div>

        <h3>Photos</h3>
        <input type="file" multiple accept="image/*" onChange={(e) => setFiles(Array.from(e.target.files))} style={{ marginBottom: 20 }} />

        <button type="submit" disabled={busy} className="hr-pill-btn primary" style={{ width: '100%', padding: 13 }}>
          {busy ? 'Saving...' : isRevise ? 'Save Changes' : 'Submit Listing'}
        </button>
      </form>
    </div>
  );
}
