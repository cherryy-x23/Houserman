import { Link } from 'react-router-dom';

export default function NotFoundView() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <h1 style={{ fontSize: 60, margin: 0, color: 'var(--brand)' }}>404</h1>
      <p style={{ color: 'var(--ink-soft)', marginBottom: 24 }}>This page does not exist.</p>
      <Link to="/" className="hr-pill-btn primary">Go Home</Link>
    </div>
  );
}
