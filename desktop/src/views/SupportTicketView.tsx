import React, { useState, useEffect } from 'react';
import { HelpCircle, Plus, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import { api } from '../services/api';

export const SupportTicketView: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('TECHNICAL');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const res = await api.getUserTickets();
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    setLoading(true);
    try {
      await api.createSupportTicket({ title, category, description });
      alert('Đã gửi Ticket hỗ trợ thành công. Đội ngũ sẽ phản hồi sớm nhất.');
      setShowForm(false);
      setTitle('');
      setCategory('TECHNICAL');
      setDescription('');
      loadTickets();
    } catch (err: any) {
      alert(err.message || 'Lỗi gửi ticket');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <span className="crm-badge crm-badge-orange"><Clock size={12}/> Chờ xử lý</span>;
      case 'IN_PROGRESS':
        return <span className="crm-badge crm-badge-blue"><Clock size={12}/> Đang xử lý</span>;
      case 'RESOLVED':
        return <span className="crm-badge crm-badge-green"><CheckCircle size={12}/> Đã giải quyết</span>;
      case 'CLOSED':
        return <span className="crm-badge crm-badge-gray"><CheckCircle size={12}/> Đóng</span>;
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Trung tâm Hỗ trợ (Tickets)</h2>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Gửi yêu cầu hỗ trợ kỹ thuật hoặc báo lỗi để được xử lý
          </div>
        </div>
        <button className="btn-desk btn-desk-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Gửi Ticket mới
        </button>
      </div>

      {showForm && (
        <div className="app-card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>Tạo Ticket Hỗ Trợ</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Tiêu đề (*)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ví dụ: Không thể kết nối MT5"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phân loại vấn đề (*)</label>
              <select
                className="form-input"
                value={category}
                onChange={e => setCategory(e.target.value)}
                required
              >
                <option value="TECHNICAL">Lỗi Kỹ Thuật (MT5, App)</option>
                <option value="BILLING">Thanh toán & License KEY</option>
                <option value="GENERAL">Hỗ trợ chung</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Mô tả chi tiết (*)</label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải để chúng tôi hỗ trợ tốt nhất..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button type="button" className="btn-desk btn-desk-secondary" onClick={() => setShowForm(false)}>
                Hủy
              </button>
              <button type="submit" className="btn-desk btn-desk-primary" disabled={loading}>
                {loading ? 'Đang gửi...' : 'Gửi Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gap: '16px' }}>
        {tickets.length === 0 ? (
          <div className="app-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <HelpCircle size={40} color="var(--border-strong)" style={{ margin: '0 auto 16px auto' }} />
            <div style={{ color: 'var(--text-muted)' }}>Bạn chưa gửi yêu cầu hỗ trợ nào</div>
          </div>
        ) : (
          tickets.map((t) => (
            <div key={t.id} className="app-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '6px' }}>
                    {getStatusBadge(t.status)}
                    <span style={{ fontSize: '0.75rem', color: '#A78BFA', fontWeight: 600 }}>{t.category}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      • {new Date(t.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{t.title}</h3>
                </div>
              </div>
              
              <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: t.adminReply ? '16px' : '0' }}>
                {t.description}
              </div>

              {t.adminReply && (
                <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid #3B82F6', borderRadius: '4px', fontSize: '0.875rem', color: '#DBEAFE', display: 'flex', gap: 10 }}>
                  <MessageSquare size={18} color="#60A5FA" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#93C5FD', marginBottom: 4 }}>Admin phản hồi:</div>
                    <div style={{ lineHeight: 1.5 }}>{t.adminReply}</div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
