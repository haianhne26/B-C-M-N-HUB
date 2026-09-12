import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Calendar, RefreshCw, Zap, TrendingUp, AlertCircle, CheckCircle2, Globe, Clock } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [macroIndicators, setMacroIndicators] = useState<any[]>([]);
  const [provider, setProvider] = useState<string>('');
  const [lastSync, setLastSync] = useState<string>('');
  const [impactFilter, setImpactFilter] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.getEconomicEvents(impactFilter, dateFilter, currencyFilter);
      setEvents(res.data || []);
      setProvider(res.provider || 'Financial Modeling Prep (FMP) Live Feed');
      setLastSync(res.lastSync || '');
      if (res.macroIndicators && res.macroIndicators.length > 0) {
        setMacroIndicators(res.macroIndicators);
      }
    } catch (err) {
      console.error('Lỗi khi tải sự kiện kinh tế:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await api.syncEconomicCalendar();
      setSyncMessage(`Đã đồng bộ ${res.result?.count || 0} sự kiện từ FMP!`);
      await fetchEvents();
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (err: any) {
      setSyncMessage('Đang lấy dữ liệu từ nguồn dự phòng real-time...');
      await fetchEvents();
      setTimeout(() => setSyncMessage(null), 4000);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [impactFilter, dateFilter, currencyFilter]);

  // Auto refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(fetchEvents, 120000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Lịch Kinh Tế (Economic Calendar)</h2>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
              FMP REAL-TIME ACTIVE
            </span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>Nguồn cấp: <strong>{provider}</strong></span>
            {lastSync && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9CA3AF' }}>
                <Clock size={13} /> Cập nhật: {new Date(lastSync).toLocaleTimeString('vi-VN')}
              </span>
            )}
          </div>
        </div>

        {/* Sync Button & Message */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {syncMessage && (
            <span style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 600 }}>
              {syncMessage}
            </span>
          )}
          <button
            className="btn-desk btn-desk-primary"
            style={{ padding: '8px 16px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={handleManualSync}
            disabled={syncing || loading}
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Đang đồng bộ FMP...' : 'Đồng bộ Real-Time'}
          </button>
        </div>
      </div>

      {/* Macro Indicators Highlights Bar (From FMP Macro API) */}
      {macroIndicators.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {macroIndicators.map((ind, idx) => (
            <div key={idx} className="app-card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{ind.label}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{ind.value}</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.6875rem', color: 'var(--primary)' }}>
                <TrendingUp size={16} />
                <div style={{ color: 'var(--text-muted)' }}>{ind.date}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="app-card" style={{ padding: '14px 18px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          {/* Date Filter */}
          <select
            className="form-input"
            style={{ width: 'auto', padding: '7px 12px', fontSize: '0.8125rem' }}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="today">📅 Hôm nay (Today)</option>
            <option value="week">📆 Tuần này (This Week)</option>
            <option value="all">🌐 Tất cả sự kiện</option>
          </select>

          {/* Currency Filter */}
          <select
            className="form-input"
            style={{ width: 'auto', padding: '7px 12px', fontSize: '0.8125rem' }}
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
          >
            <option value="">Tất cả tiền tệ</option>
            <option value="USD">🇺🇸 USD (Đô la Mỹ)</option>
            <option value="EUR">🇪🇺 EUR (Euro)</option>
            <option value="GBP">🇬🇧 GBP (Bảng Anh)</option>
            <option value="JPY">🇯🇵 JPY (Yên Nhật)</option>
            <option value="AUD">🇦🇺 AUD (Đô Úc)</option>
            <option value="CAD">🇨🇦 CAD (Đô Canada)</option>
            <option value="CHF">🇨🇭 CHF (Franc Thụy Sĩ)</option>
            <option value="NZD">🇳🇿 NZD (Đô New Zealand)</option>
            <option value="CNY">🇨🇳 CNY (Nhân dân tệ)</option>
          </select>

          {/* Impact Filter */}
          <select
            className="form-input"
            style={{ width: 'auto', padding: '7px 12px', fontSize: '0.8125rem' }}
            value={impactFilter}
            onChange={(e) => setImpactFilter(e.target.value)}
          >
            <option value="">Tất cả mức độ tác động</option>
            <option value="HIGH">🔴 Tác động mạnh (High Impact - Đỏ)</option>
            <option value="MEDIUM">🟠 Tác động vừa (Medium Impact - Cam)</option>
            <option value="LOW">🟡 Tác động thấp (Low Impact - Vàng)</option>
          </select>
        </div>

        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Hiển thị: <strong>{events.length}</strong> sự kiện
        </div>
      </div>

      {/* Events Table */}
      <div className="app-table-wrapper">
        <table className="app-table">
          <thead>
            <tr>
              <th>Thời gian (Giờ VN)</th>
              <th>Quốc gia / Tiền tệ</th>
              <th>Mức độ</th>
              <th>Sự kiện kinh tế</th>
              <th>Thực tế (Actual)</th>
              <th>Dự báo (Forecast)</th>
              <th>Trước đó (Previous)</th>
            </tr>
          </thead>
          <tbody>
            {events.length > 0 ? (
              events.map((evt) => {
                const dateObj = new Date(evt.eventTime);
                const timeStr = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                const dateStr = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

                return (
                  <tr key={evt.id}>
                    <td>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-main)' }}>
                        {timeStr}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        {dateStr}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-main)' }}>{evt.currency || evt.country}</span>
                        <span style={{ fontSize: '0.6875rem', padding: '1px 5px', borderRadius: '3px', background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
                          {evt.country}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 9px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        letterSpacing: '0.03em',
                        background: evt.impact === 'HIGH' ? 'rgba(239, 68, 68, 0.2)' : evt.impact === 'MEDIUM' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                        color: evt.impact === 'HIGH' ? '#EF4444' : evt.impact === 'MEDIUM' ? '#F59E0B' : '#9CA3AF',
                        border: evt.impact === 'HIGH' ? '1px solid rgba(239, 68, 68, 0.4)' : evt.impact === 'MEDIUM' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(156, 163, 175, 0.3)'
                      }}>
                        {evt.impact === 'HIGH' ? '🔴 HIGH' : evt.impact === 'MEDIUM' ? '🟠 MED' : '🟡 LOW'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {evt.eventName}
                    </td>
                    <td style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      fontSize: '0.9375rem',
                      color: evt.actual ? 'var(--bullish)' : 'var(--text-muted)',
                      background: evt.actual ? 'var(--bullish-bg)' : 'transparent',
                      borderRadius: '4px'
                    }}>
                      {evt.actual || '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      {evt.forecast || '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {evt.previous || '—'}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <Calendar size={32} style={{ margin: '0 auto 10px auto', opacity: 0.4 }} />
                  <div>Không tìm thấy sự kiện kinh tế nào phù hợp với bộ lọc hiện tại.</div>
                  <button
                    className="btn-desk btn-desk-secondary"
                    style={{ marginTop: '12px', fontSize: '0.8125rem' }}
                    onClick={handleManualSync}
                  >
                    Bấm để đồng bộ dữ liệu ngay
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
