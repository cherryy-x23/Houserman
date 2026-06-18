import { useEffect, useState } from 'react';
import { wishlistService } from '../services/api';
import ListingTile from '../widgets/ListingTile';

export default function SavedHomesView() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wishlistService.fetchAll().then((res) => setItems(res.data.items)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="hr-spin" /></div>;

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 18 }}>Saved Homes</h1>
      {items.length === 0 ? (
        <div className="hr-empty"><h3>No saved homes yet</h3><p>Browse listings and tap the heart icon to save them here</p></div>
      ) : (
        <div className="hr-grid">
          {items.map((i) => i.listingRef && <ListingTile key={i._id} listing={i.listingRef} />)}
        </div>
      )}
    </div>
  );
}
