import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSession } from '../store/SessionContext';
import { FiHome, FiSearch, FiHeart, FiGrid, FiMessageSquare, FiPlusSquare, FiShield, FiBell, FiLogOut } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { alertService } from '../services/api';

export default function TopBar() {
  const { account, signOutSession } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [unseenCount, setUnseenCount] = useState(0);

  useEffect(() => {
    if (!account) return;
    alertService.fetchAll().then((res) => setUnseenCount(res.data.unseenCount)).catch(() => {});
  }, [account, location.pathname]);

  const isActive = (path) => location.pathname === path;

  const links = [
    { to: '/', label: 'Home', icon: <FiHome /> },
    { to: '/find-a-home', label: 'Browse', icon: <FiSearch /> },
    ...(account?.accountType === 'seeker' ? [
      { to: '/saved-homes', label: 'Saved', icon: <FiHeart /> },
      { to: '/my-console', label: 'Console', icon: <FiGrid /> },
      { to: '/conversations', label: 'Chat', icon: <FiMessageSquare /> },
    ] : []),
    ...(account?.accountType === 'owner' ? [
      { to: '/list-a-home', label: 'List Home', icon: <FiPlusSquare /> },
      { to: '/my-console', label: 'Console', icon: <FiGrid /> },
      { to: '/conversations', label: 'Chat', icon: <FiMessageSquare /> },
    ] : []),
    ...(account?.accountType === 'manager' ? [
      { to: '/manager-console', label: 'Console', icon: <FiShield /> },
    ] : []),
  ];

  const handleSignOut = () => {
    signOutSession();
    navigate('/sign-in');
  };

  return (
    <div className="hr-topbar">
      <div className="hr-topbar-inner">
        <Link to="/" className="hr-brand">
          <span className="hr-brand-mark"><FiHome /></span>
          HouseRman
        </Link>

        <div className="hr-nav-links">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className={`hr-nav-link ${isActive(l.to) ? 'active' : ''}`}>
              {l.icon} {l.label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {account ? (
            <>
              <Link to="/alerts" style={{ position: 'relative', padding: 8, color: 'var(--ink-soft)' }}>
                <FiBell size={19} />
                {unseenCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 2, right: 2, background: 'var(--coral)', color: 'white',
                    fontSize: 10, fontWeight: 700, borderRadius: '50%', width: 16, height: 16,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{unseenCount > 9 ? '9+' : unseenCount}</span>
                )}
              </Link>
              <Link to="/my-profile" className="hr-nav-link">{account.fullName?.split(' ')[0]}</Link>
              <button onClick={handleSignOut} className="hr-pill-btn ghost" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiLogOut size={14} /> Exit
              </button>
            </>
          ) : (
            <>
              <Link to="/sign-in" className="hr-pill-btn ghost">Sign In</Link>
              <Link to="/sign-up" className="hr-pill-btn primary">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
