import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Bot,
  GraduationCap,
  Calendar,
  Globe,
  Users2,
  Shield,
  Key,
  DownloadCloud,
  FileText,
  Zap,
  LogOut,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  userRole: 'OWNER' | 'IB' | 'USER';
  onLogout: () => void;
  onOpenKeyModal: () => void;
  hasActiveKey: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  userRole,
  onLogout,
  onOpenKeyModal,
  hasActiveKey
}) => {
  return (
    <aside className="desktop-sidebar">
      <div>
        {/* Logo */}
        <div className="sidebar-logo">
          <img 
            src="/logo.jpg" 
            alt="Bạc Môn Đạo" 
            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'contain', border: '1px solid var(--border-subtle)' }} 
          />
          <div>
            <div className="sidebar-logo-title" style={{ color: 'var(--text-main)' }}>BẠC MÔN ĐẠO</div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Terminal v1.0.0</div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="sidebar-menu">
          <div className="sidebar-section-title">Trader Platform</div>

          <div
            className={`sidebar-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => onSelectView('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </div>

          <div
            className={`sidebar-item ${currentView === 'trading' ? 'active' : ''}`}
            onClick={() => onSelectView('trading')}
          >
            <TrendingUp size={18} />
            <span>Giao dịch MT5</span>
          </div>

          <div
            className={`sidebar-item ${currentView === 'ai' ? 'active' : ''}`}
            onClick={() => onSelectView('ai')}
          >
            <Bot size={18} />
            <span>Bạc Môn AI</span>
          </div>

          <div
            className={`sidebar-item ${currentView === 'courses' ? 'active' : ''}`}
            onClick={() => onSelectView('courses')}
          >
            <GraduationCap size={18} />
            <span>Khóa học</span>
          </div>

          <div
            className={`sidebar-item ${currentView === 'calendar' ? 'active' : ''}`}
            onClick={() => onSelectView('calendar')}
          >
            <Calendar size={18} />
            <span>Lịch kinh tế</span>
          </div>

          {/* IB Menu */}
          {(userRole === 'IB' || userRole === 'OWNER') && (
            <>
              <div className="sidebar-section-title">Đối tác IB</div>
              <div
                className={`sidebar-item ${currentView === 'landing-builder' ? 'active' : ''}`}
                onClick={() => onSelectView('landing-builder')}
              >
                <Globe size={18} />
                <span>Landing Pages</span>
              </div>

              <div
                className={`sidebar-item ${currentView === 'crm' ? 'active' : ''}`}
                onClick={() => onSelectView('crm')}
              >
                <Users2 size={18} />
                <span>Quản lý Lead (CRM)</span>
              </div>
            </>
          )}

          {/* OWNER / ADMIN Menu */}
          {userRole === 'OWNER' && (
            <>
              <div className="sidebar-section-title">Quản trị Hệ thống</div>
              <div
                className={`sidebar-item ${currentView === 'admin-overview' ? 'active' : ''}`}
                onClick={() => onSelectView('admin-overview')}
              >
                <Shield size={18} />
                <span>Admin Overview</span>
              </div>

              <div
                className={`sidebar-item ${currentView === 'admin-users' ? 'active' : ''}`}
                onClick={() => onSelectView('admin-users')}
              >
                <Users2 size={18} />
                <span>Quản lý User</span>
              </div>

              <div
                className={`sidebar-item ${currentView === 'admin-keys' ? 'active' : ''}`}
                onClick={() => onSelectView('admin-keys')}
              >
                <Key size={18} />
                <span>Quản lý License KEY</span>
              </div>

              <div
                className={`sidebar-item ${currentView === 'admin-updates' ? 'active' : ''}`}
                onClick={() => onSelectView('admin-updates')}
              >
                <DownloadCloud size={18} />
                <span>Cập nhật App</span>
              </div>

              <div
                className={`sidebar-item ${currentView === 'admin-logs' ? 'active' : ''}`}
                onClick={() => onSelectView('admin-logs')}
              >
                <FileText size={18} />
                <span>Audit Logs</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer Area */}
      <div className="sidebar-footer">
        {!hasActiveKey && userRole === 'USER' && (
          <button
            className="btn-desk btn-desk-primary"
            style={{ width: '100%', marginBottom: '10px', fontSize: '0.8125rem' }}
            onClick={onOpenKeyModal}
          >
            <Sparkles size={16} />
            Kích hoạt KEY
          </button>
        )}

        <div
          className="sidebar-item"
          style={{ color: 'var(--bearish)', marginTop: '8px' }}
          onClick={onLogout}
        >
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </div>
      </div>
    </aside>
  );
};
