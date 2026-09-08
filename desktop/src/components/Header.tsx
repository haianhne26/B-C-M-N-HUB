import React from 'react';
import { Activity, Key, RefreshCw, UserCheck } from 'lucide-react';

interface HeaderProps {
  title: string;
  mt5Connected: boolean;
  mt5AccountNumber?: number | null;
  onReconnectMT5: () => void;
  activeKey?: string | null;
  userRole: 'OWNER' | 'IB' | 'USER';
  userName: string;
  onOpenKeyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  mt5Connected,
  mt5AccountNumber,
  onReconnectMT5,
  activeKey,
  userRole,
  userName,
  onOpenKeyModal
}) => {
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
          <div className="key-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#93C5FD', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
            <UserCheck size={14} />
            <span>Đặc quyền {userRole} (Full Access)</span>
          </div>
        )}

        <div className={`role-badge ${userRole}`}>
          {userRole}
        </div>

        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF' }}>
          {userName}
        </div>
      </div>
    </header>
  );
};
