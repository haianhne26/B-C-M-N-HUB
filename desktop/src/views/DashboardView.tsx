import React from 'react';
import { Wallet, Key, TrendingUp, Bot, Sparkles, ArrowUpRight, ShieldCheck } from 'lucide-react';

interface DashboardViewProps {
  user: any;
  mt5Data: any;
  onNavigate: (view: string) => void;
  onOpenKeyModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  mt5Data,
  onNavigate,
  onOpenKeyModal
}) => {
  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 32px',
        marginBottom: '28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'var(--bg-app)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '12px' }}>
            <Sparkles size={13} color="var(--primary)" /> Chào mừng trở lại
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>
            Xin chào, {user?.fullName || 'Trader Bạc Môn'}!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Hệ sinh thái công cụ giao dịch, phân tích AI và quản lý rủi ro chuyên nghiệp.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-desk btn-desk-primary" onClick={() => onNavigate('trading')}>
            <TrendingUp size={16} /> Vào sàn MT5
          </button>
          <button className="btn-desk btn-desk-secondary" onClick={() => onNavigate('ai')}>
            <Bot size={16} /> Phân tích Chart AI
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="stats-cards-grid">
        <div className="app-card">
          <div className="app-card-title">
            <span>Số dư MT5 (Balance)</span>
            <Wallet size={16} color="#10B981" />
          </div>
          <div className="app-card-value" style={{ color: '#10B981' }}>
            ${mt5Data?.balance ? mt5Data.balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Equity: ${mt5Data?.equity ? mt5Data.equity.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
        </div>

        <div className="app-card">
          <div className="app-card-title">
            <span style={{ color: 'var(--text-secondary)' }}>Trạng thái License KEY</span>
            <Key size={16} color="var(--primary)" />
          </div>
          <div className="app-card-value" style={{ fontSize: '1.25rem', color: user?.activeLicenseKey ? 'var(--text-main)' : 'var(--bearish)' }}>
            {user?.activeLicenseKey ? user.activeLicenseKey : 'Chưa kích hoạt'}
          </div>
          <div style={{ fontSize: '0.75rem', color: user?.activeLicenseKey ? 'var(--primary)' : 'var(--text-muted)', marginTop: '6px', cursor: 'pointer' }} onClick={onOpenKeyModal}>
            {user?.activeLicenseKey ? 'Đã cấp phép 4/4 module' : '👉 Nhấn để nhập KEY'}
          </div>
        </div>

        <div className="app-card">
          <div className="app-card-title">
            <span style={{ color: 'var(--text-secondary)' }}>Bảo vệ rủi ro</span>
            <ShieldCheck size={16} color="#3B82F6" />
          </div>
          <div className="app-card-value" style={{ color: 'var(--text-main)' }}>
            R:R 1 : 3.0+
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Thuật toán Bạc Môn Risk Guard
          </div>
        </div>

        <div className="app-card">
          <div className="app-card-title">
            <span>Phiên giao dịch</span>
            <span style={{ fontSize: '0.75rem', color: '#10B981' }}>● LIVE</span>
          </div>
          <div className="app-card-value" style={{ fontSize: '1.25rem' }}>
            London / New York
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Biến động Vàng & Forex cao điểm
          </div>
        </div>
      </div>

      {/* Fast Shortcuts Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div className="app-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('trading')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text-main)' }}>Dashboard Giao Dịch MT5</h4>
            <ArrowUpRight size={18} color="var(--primary)" />
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Theo dõi vị thế lệnh, lãi lỗ thời gian thực và quản lý khối lượng vào lệnh qua cầu nối MT5 Bridge an toàn.
          </p>
        </div>

        <div className="app-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('ai')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text-main)' }}>Trợ Lý AI Phân Tích Kỹ Thuật</h4>
            <ArrowUpRight size={18} color="var(--primary)" />
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Chụp và gửi ảnh chart để nhận định Market Bias (BUY/SELL), Entry, Stop Loss, Take Profit và lý do vào lệnh.
          </p>
        </div>

        <div className="app-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('courses')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text-main)' }}>Kho Khóa Học & Tài Liệu</h4>
            <ArrowUpRight size={18} color="var(--primary)" />
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Hệ thống video giáo dục thực chiến: Fibo Matrix, Price Action, Bí quyết giao dịch Vàng (XAU/USD).
          </p>
        </div>
      </div>
    </div>
  );
};
