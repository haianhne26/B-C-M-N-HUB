import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { RefreshCw, Search, Filter, SlidersHorizontal, Star, Tag, Bell, MessageSquare, Phone, Eye, MoreHorizontal, Check, Edit3, X } from 'lucide-react';

const STANDARD_TAGS = [
  { name: '🔥 Hot lead', color: '#ff4d4f' },
  { name: '⏰ Đang chờ trả lời', color: '#d9d9d9' },
  { name: '🆕 Lần đầu', color: '#1890ff' },
  { name: '🚫 Không rảnh', color: '#ff4d4f' },
  { name: '📞 Cần gọi lại', color: '#722ed1' },
  { name: '💬 Đang chat', color: '#722ed1' },
  { name: '❄️ Cold lead', color: '#1890ff' },
  { name: '🤝 Đã qualify', color: '#faad14' },
];

export const CRMView: React.FC = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  
  // Status modal state
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('ALL');

  // Tag modal state
  const [tagModalLead, setTagModalLead] = useState<any | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());

  const togglePin = (id: string) => {
    setPinnedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone).then(() => {
      setCopiedPhone(phone);
      setTimeout(() => setCopiedPhone(null), 1500);
    });
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.getIBLeads();
      setLeads(res.leads || []);
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
    // ✔️ Đóng modal ngay, cập nhật UI tức thì
    const optimisticLeads = leads.map(l =>
      l.id === selectedLead.id ? { ...l, status: newStatus, notes } : l
    );
    setLeads(optimisticLeads);
    setSelectedLead(null);
    // 🔄 Đồng bộ với backend ngầm phía sau
    try {
      await api.updateLeadStatus(selectedLead.id, newStatus, notes);
    } catch (err: any) {
      // Nếu lỗi, reload lại cho chính xác
      fetchLeads();
      alert('Cập nhật thất bại: ' + err.message);
    }
  };

  const handleInlineStatusChange = async (id: string, inlineStatus: string) => {
    // ✔️ Cập nhật trạng thái trong UI ngay lập tức
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: inlineStatus } : l));
    // 🔄 Đồng bộ với backend ngầm phía sau
    try {
      await api.updateLeadStatus(id, inlineStatus);
    } catch (err: any) {
      fetchLeads(); // rollback nếu lỗi
      alert(err.message);
    }
  };

  const handleOpenTagModal = (lead: any) => {
    setTagModalLead(lead);
    setSelectedTags(lead.tags?.map((t: any) => t.name) || []);
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
    );
  };

  const handleSaveTags = async () => {
    if (!tagModalLead) return;
    const payload = selectedTags.map(name => {
      const std = STANDARD_TAGS.find(t => t.name === name);
      return { name, color: std?.color || '#7C3AED', id: name };
    });
    // ✔️ Cập nhật tags trong UI ngay lập tức
    setLeads(prev => prev.map(l =>
      l.id === tagModalLead.id ? { ...l, tags: payload } : l
    ));
    setTagModalLead(null);
    // 🔄 Đồng bộ với backend ngầm phía sau
    try {
      await api.updateLeadTags(tagModalLead.id, payload);
    } catch (err: any) {
      fetchLeads(); // rollback nếu lỗi
      alert(err.message);
    }
  };

  // Filtered Leads - pinned lên đầu
  const filteredLeads = useMemo(() => {
    const filtered = leads.filter(lead => {
      const matchSearch = lead.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          lead.phone.includes(searchQuery);
      const matchTab = activeTab === 'ALL' || lead.status === activeTab;
      return matchSearch && matchTab;
    });
    // Sắp xếp: lead ghím lên đầu
    return filtered.sort((a, b) => {
      const aPinned = pinnedIds.has(a.id) ? 0 : 1;
      const bPinned = pinnedIds.has(b.id) ? 0 : 1;
      return aPinned - bPinned;
    });
  }, [leads, searchQuery, activeTab, pinnedIds]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      ALL: leads.length,
      DUE: 0, // Placeholder
      NEW: leads.filter(l => l.status === 'NEW').length,
      CONTACTED: leads.filter(l => l.status === 'CONTACTED').length,
      CONSULTING: leads.filter(l => l.status === 'CONSULTING').length,
      CONVERTED: leads.filter(l => l.status === 'CONVERTED').length,
      REJECTED: leads.filter(l => l.status === 'REJECTED').length,
    };
  }, [leads]);

  const tabs = [
    { id: 'ALL', label: 'Tất cả', count: counts.ALL, icon: null },
    { id: 'DUE', label: 'Đến hạn', count: counts.DUE, icon: <Bell size={14} /> },
    { id: 'NEW', label: 'Mới', count: counts.NEW, icon: <Star size={14} /> },
    { id: 'CONTACTED', label: 'Đã liên hệ', count: counts.CONTACTED, icon: <Phone size={14} /> },
    { id: 'CONSULTING', label: 'Đủ điều kiện', count: counts.CONSULTING, icon: <Check size={14} /> },
    { id: 'CONVERTED', label: 'Đã chuyển đổi', count: counts.CONVERTED, icon: <Star size={14} fill="currentColor" /> },
    { id: 'REJECTED', label: 'Đã đóng', count: counts.REJECTED, icon: <Check size={14} /> },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW': return <span className="crm-badge crm-badge-blue"><Star size={12}/> Mới</span>;
      case 'CONTACTED': return <span className="crm-badge crm-badge-gray"><Phone size={12}/> Đã liên hệ</span>;
      case 'CONSULTING': return <span className="crm-badge crm-badge-orange"><Check size={12}/> Đủ điều kiện</span>;
      case 'CONVERTED': return <span className="crm-badge crm-badge-green"><Check size={12}/> Đã chuyển đổi</span>;
      case 'REJECTED': return <span className="crm-badge crm-badge-gray">Đã đóng</span>;
      default: return <span className="crm-badge">{status}</span>;
    }
  };

  return (
    <div className="crm-container">
      <div className="crm-header-area">
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Khách hàng của tôi &gt; Danh sách
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Khách hàng của tôi</h2>
          <button className="btn-desk btn-desk-secondary" onClick={fetchLeads} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Cập nhật
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="crm-tabs-container">
        {tabs.map(tab => (
          <button 
            key={tab.id} 
            className={`crm-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon && <span style={{ marginRight: '6px' }}>{tab.icon}</span>}
            {tab.label}
            <span className="crm-tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* MAIN TABLE CARD */}
      <div className="crm-table-card">
        {/* Search & Filter Bar */}
        <div className="crm-toolbar">
          <div className="crm-search-box">
            <Search size={16} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="crm-toolbar-actions">
            <button className="crm-icon-btn"><Filter size={18} /></button>
            <button className="crm-icon-btn"><SlidersHorizontal size={18} /></button>
          </div>
        </div>

        {/* Table */}
        <div className="crm-table-wrapper">
          <table className="crm-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}><input type="checkbox" /></th>
                <th style={{ width: '50px' }}>GHIM</th>
                <th style={{ width: '50px' }}>THẺ</th>
                <th>TÊN <span style={{ opacity: 0.5 }}>v</span></th>
                <th>KÊNH <span style={{ opacity: 0.5 }}>v</span></th>
                <th>ĐIỆN THOẠI</th>
                <th>TRẠNG THÁI <span style={{ opacity: 0.5 }}>v</span></th>
                <th>HẸN LIÊN HỆ <span style={{ opacity: 0.5 }}>v</span></th>
                <th>GHI CHÚ</th>
                <th style={{ textAlign: 'right' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id}>
                  <td><input type="checkbox" /></td>
                  <td>
                    <button 
                      onClick={() => togglePin(lead.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', borderRadius: '4px', transition: 'transform 0.15s' }}
                      title={pinnedIds.has(lead.id) ? 'Bỏ ghim' : 'Ghim lên đầu'}
                    >
                      <Star 
                        size={18} 
                        fill={pinnedIds.has(lead.id) ? '#F59E0B' : 'none'} 
                        color={pinnedIds.has(lead.id) ? '#F59E0B' : '#D1D5DB'} 
                        style={{ transition: 'all 0.2s' }}
                      />
                    </button>
                  </td>
                  <td>
                    {lead.tags && lead.tags.length > 0 ? (
                      <div className="crm-tags-list" onClick={() => handleOpenTagModal(lead)} style={{ cursor: 'pointer', display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '120px' }}>
                        {lead.tags.slice(0, 2).map((t: any) => (
                          <span key={t.id} style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: '#F3F4F6', color: '#4B5563', whiteSpace: 'nowrap' }}>
                            {t.name}
                          </span>
                        ))}
                        {lead.tags.length > 2 && <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>+{lead.tags.length - 2}</span>}
                      </div>
                    ) : (
                      <div className="crm-tag-icon" onClick={() => handleOpenTagModal(lead)}><Tag size={12} />+</div>
                    )}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{lead.fullName}</td>
                  <td><span className="crm-channel-badge" style={{ whiteSpace: 'nowrap' }}>{lead.landingPageTitle || 'Trực tiếp'}</span></td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <div 
                      onClick={() => handleCopyPhone(lead.phone)}
                      style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', cursor: 'pointer', position: 'relative' }}
                      title="Bấm để copy số điện thoại"
                    >
                      <Phone size={14} /> 
                      <span>{lead.phone}</span>
                      {copiedPhone === lead.phone && (
                        <span style={{ position: 'absolute', top: '-28px', left: '50%', transform: 'translateX(-50%)', background: '#1F2937', color: '#fff', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '4px', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                          ✔ Đã copy!
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <select 
                      className={`crm-badge crm-badge-inline ${
                        lead.status === 'NEW' ? 'crm-badge-blue' :
                        lead.status === 'CONTACTED' ? 'crm-badge-gray' :
                        lead.status === 'CONSULTING' ? 'crm-badge-orange' :
                        lead.status === 'CONVERTED' ? 'crm-badge-green' : 'crm-badge-gray'
                      }`}
                      value={lead.status}
                      onChange={(e) => handleInlineStatusChange(lead.id, e.target.value)}
                    >
                      <option value="NEW">✨ Mới</option>
                      <option value="CONTACTED">📞 Đã liên hệ</option>
                      <option value="CONSULTING">💬 Đủ điều kiện</option>
                      <option value="CONVERTED">🤝 Đã chuyển đổi</option>
                      <option value="REJECTED">🚫 Đã đóng</option>
                    </select>
                  </td>
                  <td style={{ fontSize: '0.8125rem' }}>
                    {lead.lastContactAt ? new Date(lead.lastContactAt).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {lead.notes}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="crm-row-actions">
                      <button className="crm-action-btn"><Bell size={14} /> Nhắc lại</button>
                      <button className="crm-action-btn" onClick={() => handleOpenLead(lead)}><Edit3 size={14} /> Ghi chú</button>
                      <button className="crm-action-btn"><MessageSquare size={14} /> Tin nhắn mẫu</button>
                      <button className="crm-action-btn"><Phone size={14} /> Liên hệ</button>
                      <button className="crm-action-btn" onClick={() => handleOpenLead(lead)}><Eye size={14} /> Xem</button>
                      <button className="crm-action-btn-icon"><MoreHorizontal size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="crm-table-footer">
          <div>Đang hiện từ 1 đến {filteredLeads.length} của {filteredLeads.length} kết quả</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Mỗi trang</span>
            <select className="form-input" style={{ width: '70px', padding: '4px 8px' }}>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
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
                <select className="form-input" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  <option value="NEW">Mới</option>
                  <option value="CONTACTED">Đã liên hệ</option>
                  <option value="CONSULTING">Đủ điều kiện</option>
                  <option value="CONVERTED">Đã chuyển đổi</option>
                  <option value="REJECTED">Đã đóng</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Ghi chú cuộc gọi / Tiến trình</label>
                <textarea className="form-input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn-desk btn-desk-secondary" onClick={() => setSelectedLead(null)}>Hủy</button>
                <button type="submit" className="btn-desk btn-desk-primary">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tag Assignment Modal */}
      {tagModalLead && (
        <div className="modal-overlay">
          <div className="crm-tag-modal">
            <div className="crm-tag-modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1F2937' }}>Gán tag cho lead</h3>
              <button className="crm-icon-btn" onClick={() => setTagModalLead(null)}><X size={20} /></button>
            </div>
            
            <div className="crm-tag-modal-body">
              <div style={{ marginBottom: '8px', fontSize: '0.875rem', color: '#4B5563' }}>Chọn tag</div>
              <div 
                style={{ fontSize: '0.875rem', color: '#F97316', cursor: 'pointer', marginBottom: '16px', fontWeight: 500 }}
                onClick={() => setSelectedTags(STANDARD_TAGS.map(t => t.name))}
              >
                Chọn tất cả
              </div>

              <div className="crm-tag-grid">
                {STANDARD_TAGS.map((tag) => (
                  <label key={tag.name} className="crm-tag-checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={selectedTags.includes(tag.name)}
                      onChange={() => toggleTag(tag.name)}
                      className="crm-tag-checkbox"
                    />
                    <span>{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="crm-tag-modal-footer">
              <button className="crm-btn-orange" onClick={handleSaveTags}>Lưu</button>
              <button className="crm-btn-outline" onClick={() => setTagModalLead(null)}>Huỷ thao tác</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
