import { useEffect, useState, useCallback } from 'react';
import { listingService } from '../services/api';
import ListingTile from '../widgets/ListingTile';
import { FiSearch } from 'react-icons/fi';

const CATEGORIES = ['Flat', 'Independent House', 'Bungalow', 'Single Room'];
const FURNISH = ['Fully Furnished', 'Partly Furnished', 'Not Furnished'];

export default function BrowseView() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    town: '', category: '', lowCost: '', highCost: '', bedroomCount: '', furnishLevel: '', occupancyState: '',
  });

  const load = useCallback(() => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
    listingService.fetchAll(params)
      .then((res) => setListings(res.data.listings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 18 }}>Browse Listings</h1>

      {/* Filter bar */}
      <div className="hr-panel" style={{ marginBottom: 22 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: 12, top: 13, color: 'var(--ink-soft)' }} />
            <input className="hr-field" style={{ paddingLeft: 34 }} name="town" placeholder="Search town..."
              value={filters.town} onChange={handleChange} />
          </div>
          <select className="hr-field" name="category" value={filters.category} onChange={handleChange}>
            <option value="">Any Category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input className="hr-field" type="number" name="lowCost" placeholder="Min Cost" value={filters.lowCost} onChange={handleChange} />
          <input className="hr-field" type="number" name="highCost" placeholder="Max Cost" value={filters.highCost} onChange={handleChange} />
          <select className="hr-field" name="bedroomCount" value={filters.bedroomCount} onChange={handleChange}>
            <option value="">Any Bedrooms</option>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+ Bed</option>)}
          </select>
          <select className="hr-field" name="furnishLevel" value={filters.furnishLevel} onChange={handleChange}>
            <option value="">Any Furnish</option>
            {FURNISH.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <select className="hr-field" name="occupancyState" value={filters.occupancyState} onChange={handleChange}>
            <option value="">All Status</option>
            <option value="Open">Open Only</option>
            <option value="Taken">Taken Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="hr-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="hr-skeleton" style={{ height: 280 }} />)}
        </div>
      ) : listings.length === 0 ? (
        <div className="hr-empty">
          <h3>No listings match your search</h3>
          <p>Try adjusting your filters</p>
        </div>
      ) : (
        <div className="hr-grid">
          {listings.map((l) => <ListingTile key={l._id} listing={l} />)}
        </div>
      )}
    </div>
  );
}
