import React, { useState, useEffect } from 'react';
import './styles/desktop.css';
import { api, getCachedUser, clearAuthToken } from './services/api';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { KeyModal } from './components/KeyModal';
import { UpdateModal } from './components/UpdateModal';

// Views
import { DashboardView } from './views/DashboardView';
import { TradingView } from './views/TradingView';
import { AIView } from './views/AIView';
import { CoursesView } from './views/CoursesView';
import { CalendarView } from './views/CalendarView';
import { LandingBuilderView } from './views/LandingBuilderView';
import { CRMView } from './views/CRMView';
import { AdminView } from './views/AdminView';
import { ProfileView } from './views/ProfileView';
import { IBOverviewView } from './views/IBOverviewView';

export const App: React.FC = () => {
  const [user, setUser] = useState<any | null>(getCachedUser());
  const [currentView, setCurrentView] = useState('dashboard');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [updateData, setUpdateData] = useState<any | null>(null);
  const [mt5Data, setMt5Data] = useState<any | null>(null);
  const [theme, setTheme] = useState(localStorage.getItem('bmh_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bmh_theme', theme);
  }, [theme]);

  // 1. Check current logged-in user on launch
  useEffect(() => {
    api.getMe()
      .then((userData) => setUser(userData))
      .catch(() => setUser(null));
  }, []);

  // 2. Startup Auto Update Check
  useEffect(() => {
    api.checkUpdate('1.0.0')
      .then((res) => {
        if (res.updateAvailable && res.data) {
          setUpdateData(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // 3. MT5 Polling
  useEffect(() => {
    if (!user) return;
    const fetchMT5 = () => {
      api.getMT5Summary()
        .then((res) => setMt5Data(res.data))
        .catch(() => {});
    };
    fetchMT5();
    const interval = setInterval(fetchMT5, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    clearAuthToken();
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Bảng điều khiển';
      case 'trading': return 'Giao dịch MT5';
      case 'ai': return 'Bạc Môn AI';
      case 'courses': return 'Khóa học';
      case 'calendar': return 'Lịch kinh tế';
      case 'ib-overview': return 'Tổng quan đối tác';
      case 'landing-builder': return 'IB Landing Pages';
      case 'crm': return 'Quản lý Lead (CRM)';
      case 'admin-overview': return 'Quản trị hệ thống';
      case 'admin-users': return 'Quản lý người dùng';
      case 'admin-keys': return 'Quản lý License KEY';
      case 'admin-updates': return 'Phát hành bản cập nhật';
      case 'admin-logs': return 'Audit Logs';
      case 'profile': return 'Hồ sơ cá nhân';
      default: return 'Bạc Môn HUB';
    }
  };

  return (
    <div className="app-container">
      {/* If not logged in, show Auth Modal */}
      {!user ? (
        <AuthModal onSuccess={(userData) => setUser(userData)} />
      ) : (
        <>
          {/* Left Sidebar */}
          <Sidebar
            currentView={currentView}
            onSelectView={(v) => setCurrentView(v)}
            userRole={user.role}
            onLogout={handleLogout}
            onOpenKeyModal={() => setShowKeyModal(true)}
            hasActiveKey={!!user.activeLicenseKey}
          />

          {/* Main Area */}
          <div className="main-wrapper">
            <Header
              title={getViewTitle()}
              mt5Connected={!!mt5Data?.isConnected}
              mt5AccountNumber={mt5Data?.accountNumber}
              onReconnectMT5={() => {
                api.getMT5Summary().then(res => setMt5Data(res.data));
              }}
              activeKey={user.activeLicenseKey}
              userRole={user.role}
              userName={user.fullName}
              onOpenKeyModal={() => setShowKeyModal(true)}
              onNavigate={(v) => setCurrentView(v)}
              onLogout={handleLogout}
              theme={theme}
              setTheme={setTheme}
            />

            <main className="desktop-content">
              {currentView === 'dashboard' && (
                <DashboardView
                  user={user}
                  mt5Data={mt5Data}
                  onNavigate={(v) => setCurrentView(v)}
                  onOpenKeyModal={() => setShowKeyModal(true)}
                />
              )}

              {currentView === 'trading' && <TradingView />}
              {currentView === 'ai' && <AIView />}
              {currentView === 'courses' && <CoursesView onOpenKeyModal={() => setShowKeyModal(true)} />}
              {currentView === 'calendar' && <CalendarView />}
              {currentView === 'ib-overview' && <IBOverviewView user={user} />}
              {currentView === 'landing-builder' && <LandingBuilderView />}
              {currentView === 'crm' && <CRMView />}
              {currentView === 'profile' && <ProfileView user={user} />}

              {/* Admin Views */}
              {currentView.startsWith('admin-') && (
                <AdminView subView={currentView.replace('admin-', '')} />
              )}
            </main>
          </div>

          {/* Key Activation Modal */}
          {showKeyModal && (
            <KeyModal
              onClose={() => setShowKeyModal(false)}
              onActivated={(keyInfo) => {
                setUser((prev: any) => ({
                  ...prev,
                  activeLicenseKey: keyInfo.keyCode,
                  allowedServices: keyInfo.allowedServices,
                }));
              }}
            />
          )}

          {/* Auto Update Notification Modal */}
          {updateData && (
            <UpdateModal
              currentVersion="1.0.0"
              updateData={updateData}
              onClose={() => setUpdateData(null)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;
