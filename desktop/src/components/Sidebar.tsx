import React, { useState } from 'react';
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
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Settings,
  Video,
  HelpCircle,
  Cpu
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAdminExpanded, setIsAdminExpanded] = useState(false);

  const isActiveAdmin = currentView.startsWith('admin-');

  return (
    <aside className={`desktop-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        {/* Logo */}
        <div className="sidebar-logo">
          <img 
            src="./logo.jpg" 
            alt="Bạc Môn Đạo" 
            style={{ width: isCollapsed ? '32px' : '40px', height: isCollapsed ? '32px' : '40px', borderRadius: '50%', objectFit: 'contain', border: '1px solid var(--border-subtle)', transition: 'all 0.3s ease' }} 
          />
          <div>
            <div className="sidebar-logo-title" style={{ color: 'var(--text-main)' }}>BẠC MÔN ĐẠO</div>
            <div className="sidebar-logo-desc" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Terminal v1.0.0</div>
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
            className={`sidebar-item ${currentView === 'calendar' ? 'active' : ''}`}
            onClick={() => onSelectView('calendar')}
          >
            <Calendar size={18} />
            <span>Lịch kinh tế</span>
          </div>

          <div className="sidebar-section-title">Hỗ Trợ & Đào Tạo</div>

          <div
            className={`sidebar-item ${currentView === 'courses' ? 'active' : ''}`}
            onClick={() => onSelectView('courses')}
          >
            <GraduationCap size={18} />
            <span>Khóa học</span>
          </div>

          <div
            className={`sidebar-item ${currentView === 'booking-zoom' ? 'active' : ''}`}
            onClick={() => onSelectView('booking-zoom')}
          >
            <Video size={18} />
            <span>Booking Zoom</span>
          </div>

          <div
            className={`sidebar-item ${currentView === 'bot-passview' ? 'active' : ''}`}
            onClick={() => onSelectView('bot-passview')}
          >
            <Cpu size={18} />
            <span>Bot & Passview</span>
          </div>

          <div
            className={`sidebar-item ${currentView === 'support-ticket' ? 'active' : ''}`}
            onClick={() => onSelectView('support-ticket')}
          >
            <HelpCircle size={18} />
            <span>Gửi Ticket Hỗ trợ</span>
          </div>

          {/* IB Menu */}
          {(userRole === 'IB' || userRole === 'OWNER') && (
            <>
              <div className="sidebar-section-title">Đối tác IB</div>
              <div
                className={`sidebar-item ${currentView === 'ib-overview' ? 'active' : ''}`}
                onClick={() => onSelectView('ib-overview')}
              >
                <TrendingUp size={18} />
                <span>Tổng quan đối tác</span>
              </div>
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
                className={`sidebar-item ${isActiveAdmin && !isAdminExpanded ? 'active' : ''}`}
                onClick={() => {
                  if (isCollapsed) setIsCollapsed(false);
                  setIsAdminExpanded(!isAdminExpanded);
                }}
                title="Quản trị Hệ thống"
              >
                <Settings size={18} />
                <span style={{ flex: 1 }}>Quản trị Hệ thống</span>
                {!isCollapsed && (isAdminExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
              </div>
              
              {isAdminExpanded && !isCollapsed && (
                <div className="sidebar-submenu">
                  <div
                    className={`sidebar-item ${currentView === 'admin-overview' ? 'active' : ''}`}
                    onClick={() => onSelectView('admin-overview')}
                  >
                    <span>Overview</span>
                  </div>
                  <div
                    className={`sidebar-item ${currentView === 'admin-users' ? 'active' : ''}`}
                    onClick={() => onSelectView('admin-users')}
                  >
                    <span>Users</span>
                  </div>
                  <div
                    className={`sidebar-item ${currentView === 'admin-keys' ? 'active' : ''}`}
                    onClick={() => onSelectView('admin-keys')}
                  >
                    <span>License KEYs</span>
                  </div>
                  <div
                    className={`sidebar-item ${currentView === 'admin-updates' ? 'active' : ''}`}
                    onClick={() => onSelectView('admin-updates')}
                  >
                    <span>Cập nhật App</span>
                  </div>
                  <div
                    className={`sidebar-item ${currentView === 'admin-logs' ? 'active' : ''}`}
                    onClick={() => onSelectView('admin-logs')}
                  >
                    <span>Audit Logs</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer Area */}
      <div className="sidebar-footer">
        {!hasActiveKey && userRole === 'USER' && (
          <button
            className="btn-desk btn-desk-primary"
            style={{ width: '100%', marginBottom: '10px', fontSize: '0.8125rem', padding: isCollapsed ? '8px' : '10px 16px', display: 'flex', justifyContent: 'center' }}
            onClick={onOpenKeyModal}
            title="Kích hoạt KEY"
          >
            <Sparkles size={16} />
            {!isCollapsed && <span style={{ marginLeft: '8px' }}>Kích hoạt KEY</span>}
          </button>
        )}

        {/* Toggle Collapse Button */}
        <div 
          className="sidebar-item" 
          style={{ marginTop: '12px', justifyContent: isCollapsed ? 'center' : 'flex-end', color: 'var(--text-muted)' }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          title="Thu gọn Menu"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </div>
      </div>
    </aside>
  );
};
