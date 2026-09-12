import React, { useState, useEffect, useRef } from 'react';
import { Activity, Key, RefreshCw, UserCheck, Sun, Moon, Monitor, LogOut, User as UserIcon, Globe } from 'lucide-react';

interface HeaderProps {
  title: string;
  mt5Connected: boolean;
  mt5AccountNumber?: number | null;
  onReconnectMT5: () => void;
  activeKey?: string | null;
  userRole: 'OWNER' | 'IB' | 'USER';
  userName: string;
  onOpenKeyModal: () => void;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  theme: string;
  setTheme: (theme: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  mt5Connected,
  mt5AccountNumber,
  onReconnectMT5,
  activeKey,
  userRole,
  userName,
  onOpenKeyModal,
  onNavigate,
  onLogout,
  theme,
  setTheme
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'BM';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="desktop-header">
      {/* Left: View Title & MT5 Connection Badge */}
      <div className="header-left">
        <div className="header-title">{title}</div>

        <div className={`mt5-badge ${mt5Connected ? 'connected' : 'disconnected'}`}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: mt5Connected ? '#10B981' : '#EF4444',
            display: 'inline-block'
          }}></span>
          <span>{mt5Connected ? `MT5: #${mt5AccountNumber || 'Live'}` : 'MT5: Chưa kết nối'}</span>
          <button
            onClick={onReconnectMT5}
            title="Đồng bộ / Reconnect MT5"
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* Right: Key Badge, Role Badge, Profile */}
      <div className="header-right">
        {userRole === 'USER' ? (
          <div className="key-badge" onClick={onOpenKeyModal}>
            <Key size={14} />
            <span>{activeKey ? activeKey : 'Nhập KEY kích hoạt'}</span>
          </div>
        ) : (
          <div className="key-badge" style={{ background: 'var(--bg-app)', color: 'var(--text-main)', borderColor: 'var(--border-subtle)' }}>
            <UserCheck size={14} />
            <span>Đặc quyền {userRole}</span>
          </div>
        )}

        <div className={`role-badge ${userRole}`}>
          {userRole}
        </div>

        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <div 
            className="header-avatar"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {getInitials(userName)}
          </div>

          {dropdownOpen && (
            <div className="profile-dropdown">
              <div 
                className="dropdown-item"
                onClick={() => { onNavigate('profile'); setDropdownOpen(false); }}
              >
                <UserIcon size={16} />
                <span>Hồ sơ</span>
              </div>
              <div className="dropdown-item">
                <Globe size={16} />
                <span>Switch to English</span>
              </div>
              
              <div className="dropdown-divider"></div>
              
              <div className="theme-toggle-group">
                <button 
                  className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                  title="Sáng"
                >
                  <Sun size={16} />
                </button>
                <button 
                  className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                  title="Tối"
                >
                  <Moon size={16} />
                </button>
                <button 
                  className={`theme-btn ${theme === 'system' ? 'active' : ''}`}
                  onClick={() => setTheme('system')}
                  title="Hệ thống"
                >
                  <Monitor size={16} />
                </button>
              </div>

              <div className="dropdown-divider"></div>

              <div 
                className="dropdown-item" 
                style={{ color: 'var(--bearish)' }}
                onClick={() => { onLogout(); setDropdownOpen(false); }}
              >
                <LogOut size={16} />
                <span>Đăng xuất</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
