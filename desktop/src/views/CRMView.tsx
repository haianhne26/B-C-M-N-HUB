import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Users2, Phone, Calendar, MessageSquare, RefreshCw, CheckCircle } from 'lucide-react';

export const CRMView: React.FC = () => {
  const [kanban, setKanban] = useState<any>({ NEW: [], CONTACTED: [], CONSULTING: [], CONVERTED: [], REJECTED: [] });
  const [total, setTotal] = useState(0);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.getIBLeads();
      setKanban(res.kanban || { NEW: [], CONTACTED: [], CONSULTING: [], CONVERTED: [], REJECTED: [] });
      setTotal(res.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleOpenLead = (lead: any) => {
    setSelectedLead(lead);
    setNewStatus(lead.status);
    setNotes(lead.notes || '');
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    try {
      await api.updateLeadStatus(selectedLead.id, newStatus, notes);
      setSelectedLead(null);
      fetchLeads();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const columns = [
    { key: 'NEW', label: 'Lead Mới', color: '#60A5FA' },
    { key: 'CONTACTED', label: 'Đã Liên Hệ', color: '#F59E0B' },
    { key: 'CONSULTING', label: 'Cần Tư Vấn Thêm', color: '#A78BFA' },
    { key: 'CONVERTED', label: 'Đã Chuyển Đổi', color: '#10B981' },
    { key: 'REJECTED', label: 'Từ Chối', color: '#EF4444' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Hệ Thống Quản Lý Khách Hàng (IB CRM)</h2>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Theo dõi đường ống khách hàng tiềm năng (Pipeline) theo thời gian thực • Tổng số: {total} Leads
          </div>
        </div>

        <button className="btn-desk btn-desk-secondary" onClick={fetchLeads} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Cập nhật
        </button>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {columns.map((col) => (
          <div key={col.key} className="kanban-col">
            <div className="kanban-col-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }}></span>
                {col.label}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '10px' }}>
                {kanban[col.key]?.length || 0}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
              {kanban[col.key]?.map((lead: any) => (
                <div key={lead.id} className="kanban-card" onClick={() => handleOpenLead(lead)}>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '6px' }}>
                    {lead.fullName}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: 4, marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
                    <Phone size={12} /> {lead.phone}
                  </div>
                  {lead.notes && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.4 }}>
                      {lead.notes}
                    </div>
                  )}
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    {new Date(lead.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Lead Edit Modal */}
      {selectedLead && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="modal-title">Cập nhật thông tin Lead</h3>
            <p className="modal-desc">{selectedLead.fullName} • {selectedLead.phone}</p>

            <form onSubmit={handleUpdateLead}>
              <div className="form-group">
                <label className="form-label">Trạng thái xử lý</label>
                <select
                  className="form-input"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="NEW">Lead Mới</option>
                  <option value="CONTACTED">Đã Liên Hệ</option>
                  <option value="CONSULTING">Cần Tư Vấn Thêm</option>
                  <option value="CONVERTED">Đã Chuyển Đổi</option>
                  <option value="REJECTED">Từ Chối</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Ghi chú cuộc gọi / Tiến trình tư vấn</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi nhận phản hồi của khách hàng..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn-desk btn-desk-secondary" onClick={() => setSelectedLead(null)}>Hủy</button>
                <button type="submit" className="btn-desk btn-desk-primary">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
