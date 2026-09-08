import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RefreshCw, TrendingUp, TrendingDown, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const TradingView: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'positions' | 'history'>('positions');

  const fetchData = async () => {
    setLoading(true);
    try {
      const sumRes = await api.getMT5Summary();
      setSummary(sumRes.data);
      const posRes = await api.getMT5Positions();
      setPositions(posRes.data || []);
      const histRes = await api.getMT5History();
      setHistory(histRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Top Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Dashboard Giao Dịch MT5</h2>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Kết nối trực tiếp MetaTrader 5 thông qua Bạc Môn EA Bridge
          </div>
        </div>

        <button className="btn-desk btn-desk-secondary" onClick={fetchData} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Đồng bộ dữ liệu
        </button>
      </div>

      {/* Account Metrics Grid */}
      <div className="stats-cards-grid">
        <div className="app-card">
          <div className="app-card-title">Số dư (Balance)</div>
          <div className="app-card-value" style={{ color: '#10B981' }}>
            ${summary?.balance ? summary.balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Broker: {summary?.broker || 'Chưa kết nối'}
          </div>
        </div>

        <div className="app-card">
          <div className="app-card-title">Tài sản thực (Equity)</div>
          <div className="app-card-value">
            ${summary?.equity ? summary.equity.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          <div style={{ fontSize: '0.75rem', color: summary?.profit >= 0 ? '#10B981' : '#EF4444', marginTop: '4px' }}>
            Lãi/Lỗ: {summary?.profit >= 0 ? '+' : ''}${summary?.profit?.toFixed(2) || '0.00'}
          </div>
        </div>

        <div className="app-card">
          <div className="app-card-title">Ký quỹ sử dụng (Margin)</div>
          <div className="app-card-value" style={{ color: '#C4B5FD' }}>
            ${summary?.margin ? summary.margin.toFixed(2) : '0.00'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Dư ký quỹ: ${summary?.freeMargin ? summary.freeMargin.toFixed(2) : '0.00'}
          </div>
        </div>

        <div className="app-card">
          <div className="app-card-title">Mức ký quỹ (Margin Level)</div>
          <div className="app-card-value" style={{ color: '#60A5FA' }}>
            {summary?.marginLevel ? `${summary.marginLevel.toFixed(1)}%` : '0.0%'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '4px' }}>
            {summary?.isConnected ? '● Tài khoản an toàn' : '● Chưa kết nối'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          className={`btn-desk ${activeTab === 'positions' ? 'btn-desk-primary' : 'btn-desk-secondary'}`}
          onClick={() => setActiveTab('positions')}
        >
          Lệnh đang mở ({positions.length})
        </button>
        <button
          className={`btn-desk ${activeTab === 'history' ? 'btn-desk-primary' : 'btn-desk-secondary'}`}
          onClick={() => setActiveTab('history')}
        >
          Lịch sử lệnh đóng ({history.length})
        </button>
      </div>

      {/* Tables Container */}
      {activeTab === 'positions' ? (
        positions.length > 0 ? (
          <div className="app-table-wrapper">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Cặp tiền</th>
                  <th>Loại</th>
                  <th>Khối lượng</th>
                  <th>Giá vào</th>
                  <th>Giá hiện tại</th>
                  <th>SL / TP</th>
                  <th>Lãi / Lỗ</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos) => (
                  <tr key={pos.id || pos.ticket}>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>#{pos.ticket}</td>
                    <td style={{ fontWeight: 700 }}>{pos.symbol}</td>
                    <td>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: pos.type === 'BUY' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: pos.type === 'BUY' ? '#10B981' : '#EF4444'
                      }}>
                        {pos.type}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{pos.volume.toFixed(2)}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{pos.openPrice.toFixed(2)}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{pos.currentPrice.toFixed(2)}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {pos.sl || 0} / {pos.tp || 0}
                    </td>
                    <td style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: pos.profit >= 0 ? '#10B981' : '#EF4444'
                    }}>
                      {pos.profit >= 0 ? '+' : ''}${pos.profit.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="app-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <AlertCircle size={36} color="#6B7280" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontWeight: 700, marginBottom: '6px' }}>Không có vị thế lệnh nào đang mở</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Khi bạn đặt lệnh trên MetaTrader 5 có gắn EA Bạc Môn, các lệnh sẽ tự động xuất hiện tại đây ngay lập tức.
            </p>
          </div>
        )
      ) : (
        history.length > 0 ? (
          <div className="app-table-wrapper">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Cặp tiền</th>
                  <th>Loại</th>
                  <th>Khối lượng</th>
                  <th>Giá vào</th>
                  <th>Giá đóng</th>
                  <th>Lợi nhuận</th>
                </tr>
              </thead>
              <tbody>
                {history.map((t) => (
                  <tr key={t.id || t.ticket}>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>#{t.ticket}</td>
                    <td style={{ fontWeight: 700 }}>{t.symbol}</td>
                    <td>{t.type}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{t.volume.toFixed(2)}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{t.openPrice.toFixed(2)}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{t.closePrice.toFixed(2)}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: t.profit >= 0 ? '#10B981' : '#EF4444' }}>
                      {t.profit >= 0 ? '+' : ''}${t.profit.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="app-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '6px' }}>Chưa có lịch sử lệnh đóng</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Các lệnh đã chốt lời / cắt lỗ sẽ được lưu trữ tại đây.</p>
          </div>
        )
      )}
    </div>
  );
};
