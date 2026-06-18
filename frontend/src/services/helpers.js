export const formatCost = (n) => {
  if (n == null) return '₹0';
  return `₹${Number(n).toLocaleString('en-IN')}`;
};

export const formatWhen = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const timeSince = (d) => {
  if (!d) return '';
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export const buildThreadTag = (idA, idB, listingId) => {
  const sorted = [idA, idB].sort();
  return listingId ? `${sorted[0]}_${sorted[1]}_${listingId}` : `${sorted[0]}_${sorted[1]}`;
};

export const fallbackImage = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=700';

export const getListingImage = (listing) => listing?.pictures?.[0]?.url || fallbackImage;
