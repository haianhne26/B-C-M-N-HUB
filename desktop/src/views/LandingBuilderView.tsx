import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Globe, Plus, ExternalLink, Copy, Check, Trash2 } from 'lucide-react';

export const LandingBuilderView: React.FC = () => {
  const [pages, setPages] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  
  // Customization fields
  const [heroTitle, setHeroTitle] = useState('Đầu Tư Thông Minh Cùng Bạc Môn');
  const [heroSubtitle, setHeroSubtitle] = useState('Hệ thống hỗ trợ giao dịch chuẩn xác');
  const [heroBgUrl, setHeroBgUrl] = useState('');
  
  const [countdownDate, setCountdownDate] = useState('');
  const [mentorName, setMentorName] = useState('Hải Anh');
  
  const [benefitsList, setBenefitsList] = useState('Tín hiệu phân tích chuẩn\nHỗ trợ 1-1\nTham gia nhóm VIP miễn phí');
  const [formTitle, setFormTitle] = useState('Đăng Ký Nhận Tư Vấn Miễn Phí');

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchPages = async () => {
    try {
      const res = await api.getIBLandingPages();
      setPages(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sections = [
        { id: 'hero', type: 'Hero', title: heroTitle, subtitle: heroSubtitle, bgImage: heroBgUrl },
        { id: 'countdown', type: 'Countdown', props: { targetDate: countdownDate || undefined } },
        { id: 'topics', type: 'Topics' },
        { id: 'mentor', type: 'MentorProfile', props: { mentorName: mentorName } },
        { id: 'benefits', type: 'Benefits', title: 'Tại Sao Chọn Chúng Tôi', items: benefitsList.split('\n').map(s => s.trim()).filter(Boolean) },
        { id: 'lead-form', type: 'LeadForm', title: formTitle }
      ];

      await api.createIBLandingPage({ title, slug, seoDescription, sections });
      setTitle('');
      setSlug('');
      setSeoDescription('');
      setHeroTitle('Đầu Tư Thông Minh Cùng Bạc Môn');
      setHeroSubtitle('Hệ thống hỗ trợ giao dịch chuẩn xác');
      setHeroBgUrl('');
      setBenefitsList('Tín hiệu phân tích chuẩn\nHỗ trợ 1-1\nTham gia nhóm VIP miễn phí');
      setFormTitle('Đăng Ký Nhận Tư Vấn Miễn Phí');
      setShowCreate(false);
      fetchPages();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const copyUrl = (slugName: string, id: string) => {
    // Trỏ về Web Frontend (GitHub Pages) với HashRouter
    const url = `https://haianhne26.github.io/B-C-M-N-HUB/#/p/${slugName}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa Landing Page "${title}" không? Các Leads liên quan sẽ bị xóa.`)) {
      try {
        await api.deleteIBLandingPage(id);
        fetchPages();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>IB Landing Page Builder</h2>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Tạo các trang đích cá nhân hóa để thu hút khách hàng tiềm năng về CRM của bạn
          </div>
        </div>

        <button className="btn-desk btn-desk-primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> Tạo Landing Page mới
        </button>
      </div>

      {showCreate && (
        <div className="app-card" style={{ marginBottom: '24px', border: '1px solid rgba(124, 58, 237, 0.4)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>Thiết lập trang đích mới</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Tiêu đề trang</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ví dụ: Đầu Tư Vàng Thực Chiến Cùng Mr. Bạc Môn"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Slug đường dẫn (URL)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="dau-tu-vang-vip"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Mô tả ngắn (SEO)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Tham gia nhóm nhận tín hiệu Vàng & Forex miễn phí hàng ngày..."
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
              />
            </div>
            
            <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: '20px 0 16px', color: '#A78BFA' }}>Nội dung trang web</h4>
            <div className="form-group">
              <label className="form-label">Tiêu đề Hero (Phần đầu trang)</label>
              <input
                type="text"
                className="form-input"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Phụ đề Hero</label>
                <input
                  type="text"
                  className="form-input"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Ảnh nền Hero (Link ảnh URL)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://..."
                  value={heroBgUrl}
                  onChange={(e) => setHeroBgUrl(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Ngày Livestream (Đếm ngược)</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={countdownDate}
                  onChange={(e) => setCountdownDate(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tên Chuyên Gia (Mentor)</label>
                <input
                  type="text"
                  className="form-input"
                  value={mentorName}
                  onChange={(e) => setMentorName(e.target.value)}
                  placeholder="Hải Anh"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Danh sách lợi ích (Mỗi dòng một lợi ích)</label>
              <textarea
                className="form-input"
                rows={3}
                value={benefitsList}
                onChange={(e) => setBenefitsList(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tiêu đề Form Đăng ký</label>
              <input
                type="text"
                className="form-input"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-desk btn-desk-secondary" onClick={() => setShowCreate(false)}>Hủy</button>
              <button type="submit" className="btn-desk btn-desk-primary">Lưu & Xuất bản</button>
            </div>
          </form>
        </div>
      )}

      {/* Pages List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {pages.map((p) => (
          <div key={p.id} className="app-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <h4 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>{p.title}</h4>
              <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: 700, background: 'rgba(16, 185, 129, 0.2)', color: '#10B981' }}>
                ONLINE
              </span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#A78BFA', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>
              /p/{p.slug}
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
              {p.seoDescription || 'Trang đích thu thập Lead tự động kết nối CRM.'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {p._count?.leads || 0} Lead đã đăng ký
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn-desk btn-desk-secondary btn-desk-sm"
                  onClick={() => handleDelete(p.id, p.title)}
                  title="Xóa trang đích"
                  style={{ padding: '0 8px', color: '#EF4444' }}
                >
                  <Trash2 size={14} />
                </button>
                <button
                  className="btn-desk btn-desk-secondary btn-desk-sm"
                  onClick={() => copyUrl(p.slug, p.id)}
                  title="Sao chép link trang đích"
                >
                  {copiedId === p.id ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                  {copiedId === p.id ? 'Đã chép' : 'Copy link'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
