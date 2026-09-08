import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Calendar, Filter, RefreshCw } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [impactFilter, setImpactFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.getEconomicEvents(impactFilter, dateFilter);
      setEvents(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [impactFilter, dateFilter]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Lịch Kinh Tế (Economic Calendar)</h2>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Theo dõi các tin tức và chỉ số vĩ mô ảnh hưởng mạnh đến thị trường Vàng & Tiền tệ
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            className="form-input"
            style={{ width: 'auto', padding: '8px 12px', fontSize: '0.8125rem' }}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="today">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="all">Tất cả</option>
          </select>

          <select
            className="form-input"
            style={{ width: 'auto', padding: '8px 12px', fontSize: '0.8125rem' }}
            value={impactFilter}
            onChange={(e) => setImpactFilter(e.target.value)}
          >
            <option value="">Tất cả mức độ</option>
            <option value="HIGH">🔴 Tác động mạnh (High Impact)</option>
            <option value="MEDIUM">🟠 Tác động vừa (Medium Impact)</option>
            <option value="LOW">🟡 Tác động thấp (Low Impact)</option>
          </select>

          <button className="btn-desk btn-desk-secondary" onClick={fetchEvents} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="app-table-wrapper">
        <table className="app-table">
          <thead>
            <tr>
              <th>Thời gian</th>
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
              events.map((evt) => (
                <tr key={evt.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {new Date(evt.eventTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, marginRight: 6 }}>{evt.country}</span>
                    <span style={{ color: '#A78BFA', fontSize: '0.8125rem' }}>{evt.currency}</span>
                  </td>
                  <td>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: evt.impact === 'HIGH' ? 'rgba(239, 68, 68, 0.2)' : evt.impact === 'MEDIUM' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                      color: evt.impact === 'HIGH' ? '#EF4444' : evt.impact === 'MEDIUM' ? '#F59E0B' : '#9CA3AF'
                    }}>
                      {evt.impact}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{evt.eventName}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: evt.actual ? '#10B981' : 'var(--text-muted)' }}>
                    {evt.actual || '—'}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    {evt.forecast || '—'}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {evt.previous || '—'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  Không có sự kiện kinh tế nào phù hợp với bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
