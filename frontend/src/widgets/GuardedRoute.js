import { Navigate } from 'react-router-dom';
import { useSession } from '../store/SessionContext';

export default function GuardedRoute({ children, allow }) {
  const { account, booting } = useSession();

  if (booting) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="hr-spin" /></div>;
  if (!account) return <Navigate to="/sign-in" replace />;
  if (allow && !allow.includes(account.accountType)) return <Navigate to="/" replace />;
  return children;
}
