import React, { useState, useEffect } from 'react';
import { Video, Calendar, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../services/api';

export const BookingZoomView: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [topic, setTopic] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const res = await api.getUserBookings();
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !bookingDate) return;
    setLoading(true);
    try {
      await api.createZoomBooking({ topic, bookingDate, notes });
      alert('Đã gửi yêu cầu Booking Zoom thành công. Vui lòng chờ phản hồi.');
      setShowForm(false);
      setTopic('');
      setBookingDate('');
      setNotes('');
      loadBookings();
    } catch (err: any) {
      alert(err.message || 'Lỗi gửi yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="crm-badge crm-badge-orange"><Clock size={12}/> Chờ xác nhận</span>;
      case 'CONFIRMED':
        return <span className="crm-badge crm-badge-green"><CheckCircle size={12}/> Đã xác nhận</span>;
      case 'CANCELLED':
        return <span className="crm-badge crm-badge-gray"><XCircle size={12}/> Đã hủy</span>;
      case 'COMPLETED':
        return <span className="crm-badge crm-badge-blue"><CheckCircle size={12}/> Hoàn thành</span>;
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Booking Zoom Hỗ Trợ</h2>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Đặt lịch trực tuyến qua Zoom để được chuyên gia tư vấn trực tiếp
          </div>
        </div>
        <button className="btn-desk btn-desk-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Đặt lịch mới
        </button>
      </div>

      {showForm && (
        <div className="app-card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>Tạo yêu cầu Booking</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Chủ đề cần tư vấn (*)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ví dụ: Tư vấn chiến lược giao dịch Vàng"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Ngày và Giờ mong muốn (*)</label>
              <input
                type="datetime-local"
                className="form-input"
                value={bookingDate}
                onChange={e => setBookingDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Ghi chú thêm (Nếu có)</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Câu hỏi chi tiết hoặc vấn đề bạn đang gặp phải..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button type="button" className="btn-desk btn-desk-secondary" onClick={() => setShowForm(false)}>
                Hủy
              </button>
              <button type="submit" className="btn-desk btn-desk-primary" disabled={loading}>
                {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="app-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="app-table">
          <thead>
            <tr>
              <th>Thời gian (Dự kiến)</th>
              <th>Chủ đề</th>
              <th>Trạng thái</th>
              <th>Link Zoom</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '32px' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Chưa có lịch hẹn nào</div>
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                      <Calendar size={14} color="var(--text-secondary)" />
                      {new Date(b.bookingDate).toLocaleString('vi-VN')}
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{b.topic}</td>
                  <td>{getStatusBadge(b.status)}</td>
                  <td>
                    {b.zoomLink ? (
                      <a href={b.zoomLink} target="_blank" rel="noreferrer" style={{ color: '#60A5FA', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Video size={14} /> Tham gia
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Chưa có link</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
