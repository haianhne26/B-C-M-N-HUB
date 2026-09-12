import React, { useState, useEffect } from 'react';
import { MousePointerClick, UserPlus, TrendingUp, UserCheck, ExternalLink, ChevronRight, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface IBOverviewViewProps {
  user: any;
  onNavigate?: (view: string) => void;
}

export const IBOverviewView: React.FC<IBOverviewViewProps> = ({ user, onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getIBOverview()
      .then(res => {
        setData(res.data);
      })
      .catch(err => {
        console.error('Error fetching IB overview', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px', color: 'var(--text-muted)' }}>
        <Loader2 className="spinner" size={24} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px' }}>Tổng quan đối tác</h2>
        <div style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          Chào {user?.fullName || 'bạn'} — đây là việc cần làm và thu nhập của bạn hôm nay.
        </div>
      </div>

      {/* Hiệu suất tuần này */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
          HIỆU SUẤT TUẦN NÀY
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--border-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ background: 'var(--bg-card)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: '12px' }}>
              <MousePointerClick size={16} /> Lượt click
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{data?.clicks || 0}</div>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: '12px' }}>
              <UserPlus size={16} /> Lead mới
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{data?.newLeads || 0}</div>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: '12px' }}>
              <TrendingUp size={16} /> Chuyển đổi
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{data?.conversions || 0}</div>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: '12px' }}>
              <UserCheck size={16} /> Khách bấm mở TK
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{data?.openAccounts || 0}</div>
          </div>
        </div>
      </div>

      {/* Cần xử lý */}
      <div className="app-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>Cần xử lý</h3>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('crm'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}
          >
            Mở CRM <ExternalLink size={14} />
          </a>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <button className="btn-desk btn-desk-secondary" style={{ borderRadius: '20px', padding: '6px 16px', fontSize: '0.8125rem', background: 'transparent' }}>
            Đến hạn hôm nay <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', marginLeft: '6px', color: 'var(--text-muted)' }}>0</span>
          </button>
          <button className="btn-desk" style={{ borderRadius: '20px', padding: '6px 16px', fontSize: '0.8125rem', background: 'var(--text-main)', color: 'var(--bg-app)', fontWeight: 600 }}>
            Lead mới chưa liên hệ <span style={{ background: 'var(--bg-card)', padding: '2px 8px', borderRadius: '12px', marginLeft: '6px', color: 'var(--text-main)' }}>{data?.pendingCount || 0}</span>
          </button>
        </div>

        {/* List items */}
        <div style={{ padding: '0 24px' }}>
          {data?.actionLeads && data.actionLeads.length > 0 ? (
            data.actionLeads.map((lead: any, idx: number) => {
              const initials = lead.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
              return (
                <div key={lead.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: idx !== data.actionLeads.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '4px' }}>{lead.fullName}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{lead.phone} • {lead.email || 'Chưa có email'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.8125rem', color: '#60A5FA', fontWeight: 600 }}>{lead.status}</span>
                    <button className="btn-desk btn-desk-secondary" style={{ padding: '6px', borderRadius: '50%' }} onClick={() => { if (onNavigate) onNavigate('crm'); }}>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Không có lead mới nào chưa liên hệ.
            </div>
          )}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Còn <b>{data?.pendingCount || 0}</b> khách trong CRM</div>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('crm'); }}
            style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Xem tất cả <ChevronRight size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};
