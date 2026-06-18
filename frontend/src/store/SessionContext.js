import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { identityService } from '../services/api';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [booting, setBooting] = useState(true);

  const loadSession = useCallback(async () => {
    const token = localStorage.getItem('hr_token');
    if (!token) { setBooting(false); return; }
    try {
      const res = await identityService.whoAmI();
      setAccount(res.data.account);
    } catch {
      localStorage.removeItem('hr_token');
      localStorage.removeItem('hr_account');
    } finally {
      setBooting(false);
    }
  }, []);

  useEffect(() => { loadSession(); }, [loadSession]);

  const signInSession = (token, accountData) => {
    localStorage.setItem('hr_token', token);
    localStorage.setItem('hr_account', JSON.stringify(accountData));
    setAccount(accountData);
  };

  const signOutSession = () => {
    localStorage.removeItem('hr_token');
    localStorage.removeItem('hr_account');
    setAccount(null);
  };

  const patchAccount = (patch) => {
    setAccount((prev) => ({ ...prev, ...patch }));
  };

  return (
    <SessionContext.Provider value={{ account, booting, signInSession, signOutSession, patchAccount }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
