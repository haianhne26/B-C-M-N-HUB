import React from 'react';
import { User, Mail, Phone, MapPin, Shield } from 'lucide-react';

interface ProfileViewProps {
  user: any;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user }) => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px' }}>Hồ sơ Cá nhân</h2>
      
      <div className="app-card" style={{ padding: '32px', display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        <div style={{ 
          width: '100px', 
          height: '100px', 
          borderRadius: '50%', 
          background: 'var(--text-main)', 
          color: 'var(--bg-app)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: '2.5rem', 
          fontWeight: 800,
          flexShrink: 0
        }}>
          {user?.fullName ? user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'BM'}
        </div>
        
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>{user?.fullName || 'Trader Bạc Môn'}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            <Shield size={16} />
            <span className={`role-badge ${user?.role}`}>{user?.role || 'USER'}</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)' }}>
              <Mail size={16} color="var(--text-muted)" />
              <span>{user?.email || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)' }}>
              <Phone size={16} color="var(--text-muted)" />
              <span>{user?.phone || 'Chưa cập nhật số điện thoại'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)' }}>
              <MapPin size={16} color="var(--text-muted)" />
              <span>Vietnam</span>
            </div>
          </div>
          
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)' }}>
            <button className="btn-desk btn-desk-primary">
              Cập nhật thông tin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
