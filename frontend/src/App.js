import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './assets/global.css';

import { SessionProvider } from './store/SessionContext';
import TopBar from './widgets/TopBar';
import GuardedRoute from './widgets/GuardedRoute';

import HomeView from './views/HomeView';
import BrowseView from './views/BrowseView';
import ListingDetailView from './views/ListingDetailView';
import SignInView from './views/SignInView';
import SignUpView from './views/SignUpView';
import ForgotPasscodeView from './views/ForgotPasscodeView';
import ResetPasscodeView from './views/ResetPasscodeView';
import ListHomeView from './views/ListHomeView';
import MyConsoleView from './views/MyConsoleView';
import ManagerConsoleView from './views/ManagerConsoleView';
import ConversationsView from './views/ConversationsView';
import SavedHomesView from './views/SavedHomesView';
import AlertsView from './views/AlertsView';
import ProfileView from './views/ProfileView';
import NotFoundView from './views/NotFoundView';

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <div className="hr-shell">
          <TopBar />
          <div className="hr-main">
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/find-a-home" element={<BrowseView />} />
              <Route path="/find-a-home/:id" element={<ListingDetailView />} />
              <Route path="/sign-in" element={<SignInView />} />
              <Route path="/sign-up" element={<SignUpView />} />
              <Route path="/forgot-passcode" element={<ForgotPasscodeView />} />
              <Route path="/reset-passcode/:code" element={<ResetPasscodeView />} />

              <Route path="/list-a-home" element={<GuardedRoute allow={['owner']}><ListHomeView /></GuardedRoute>} />
              <Route path="/list-a-home/:id/revise" element={<GuardedRoute allow={['owner']}><ListHomeView /></GuardedRoute>} />
              <Route path="/my-console" element={<GuardedRoute allow={['owner', 'seeker']}><MyConsoleView /></GuardedRoute>} />
              <Route path="/manager-console" element={<GuardedRoute allow={['manager']}><ManagerConsoleView /></GuardedRoute>} />
              <Route path="/conversations" element={<GuardedRoute><ConversationsView /></GuardedRoute>} />
              <Route path="/conversations/:threadTag" element={<GuardedRoute><ConversationsView /></GuardedRoute>} />
              <Route path="/saved-homes" element={<GuardedRoute allow={['seeker']}><SavedHomesView /></GuardedRoute>} />
              <Route path="/alerts" element={<GuardedRoute><AlertsView /></GuardedRoute>} />
              <Route path="/my-profile" element={<GuardedRoute><ProfileView /></GuardedRoute>} />

              <Route path="*" element={<NotFoundView />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
    </SessionProvider>
  );
}
