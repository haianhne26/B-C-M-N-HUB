import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Copy, Check, Trash2, LayoutTemplate, Palette, Clock, User, Settings, CheckSquare, Globe, ExternalLink, X } from 'lucide-react';

interface TrustIndicator {
  value: string;
  label: string;
}

interface MentorStat {
  value: string;
  label: string;
}

interface BenefitItem {
  id: string;
  text: string;
}

export const LandingBuilderView: React.FC = () => {
  const [pages, setPages] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'theme' | 'hero' | 'countdown' | 'mentor' | 'benefits'>('general');

  // === General ===
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // === Theme ===
  const [primaryColor, setPrimaryColor] = useState('#F46D00');

  // === Hero ===
  const [heroTitle, setHeroTitle] = useState('Đầu Tư Thông Minh Cùng Bạc Môn');
  const [heroSubtitle, setHeroSubtitle] = useState('Hệ thống hỗ trợ giao dịch chuyên nghiệp, giúp bạn kiếm tiền nhất quán từ thị trường tài chính.');
  const [heroBgUrl, setHeroBgUrl] = useState('');
  const [heroCtaText, setHeroCtaText] = useState('Đăng Ký Nhận Link Ngay');
  const [heroChips, setHeroChips] = useState('Tư duy giao dịch\nPhân tích kỹ thuật\nQuản lý vốn');
  const [trustIndicators, setTrustIndicators] = useState<TrustIndicator[]>([
    { value: '1,000+', label: 'Trader đã tham gia hệ thống' },
    { value: '100%', label: 'Miễn phí hoàn toàn cho người mới' },
  ]);

  // === Countdown ===
  const [countdownDate, setCountdownDate] = useState('');
  const [tickerText, setTickerText] = useState('CHÚ Ý: KHÔNG PHÁT LẠI SAU KHI KẾT THÚC\nĐẶT CHỖ NGAY ĐỂ KHÔNG BỎ LỠ');
  const [slotsTotal, setSlotsTotal] = useState(1000);
  const [countdownPlatform, setCountdownPlatform] = useState('Zoom (link gửi qua Zalo sau khi đăng ký)');

  // === Mentor ===
  const [mentorName, setMentorName] = useState('Hải Anh');
  const [mentorTitle, setMentorTitle] = useState('★ Top KOL Forex Việt Nam');
  const [mentorDesc, setMentorDesc] = useState('Trader & Mentor chuyên Vàng, Forex với hơn 8 năm thực chiến và 5+ năm đào tạo trực tiếp trên thị trường. Theo đuổi phương pháp giao dịch nhất quán và kỷ luật.');
  const [mentorImageUrl, setMentorImageUrl] = useState('');
  const [mentorStats, setMentorStats] = useState<MentorStat[]>([
    { value: '8+ năm', label: 'Kinh nghiệm' },
    { value: '300K+', label: 'Theo dõi' },
    { value: '8+', label: 'Chủ đề' },
  ]);

  // === Topics ===
  const [topics, setTopics] = useState<{ id: string, title: string, desc: string }[]>([
    { id: '1', title: 'Tổng quan thị trường tài chính & Forex', desc: 'Hiểu đúng bản chất, cơ hội và rủi ro.' },
    { id: '2', title: 'Phương pháp Price Action thực chiến', desc: 'Đọc hành động giá không cần chỉ báo phức tạp.' },
    { id: '3', title: 'Quản trị vốn & Tâm lý giao dịch thép', desc: 'Bí quyết sống sót và sinh lời bền vững.' },
  ]);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');

  // === Benefits & Form ===
  const [benefits, setBenefits] = useState<BenefitItem[]>([
    { id: '1', text: 'Tín hiệu phân tích chuẩn mỗi ngày' },
    { id: '2', text: 'Hỗ trợ 1-1 từ Mentor kinh nghiệm' },
    { id: '3', text: 'Tham gia nhóm VIP miễn phí' },
  ]);
  const [newBenefit, setNewBenefit] = useState('');
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

  useEffect(() => { fetchPages(); }, []);

  // Trust Indicator helpers
  const addTrustIndicator = () => setTrustIndicators([...trustIndicators, { value: '', label: '' }]);
  const updateTrustIndicator = (idx: number, field: 'value' | 'label', val: string) => {
    setTrustIndicators(trustIndicators.map((t, i) => i === idx ? { ...t, [field]: val } : t));
  };
  const removeTrustIndicator = (idx: number) => setTrustIndicators(trustIndicators.filter((_, i) => i !== idx));

  // Mentor Stat helpers
  const addMentorStat = () => setMentorStats([...mentorStats, { value: '', label: '' }]);
  const updateMentorStat = (idx: number, field: 'value' | 'label', val: string) => {
    setMentorStats(mentorStats.map((s, i) => i === idx ? { ...s, [field]: val } : s));
  };
  const removeMentorStat = (idx: number) => setMentorStats(mentorStats.filter((_, i) => i !== idx));

  // Benefit helpers
  const addBenefit = () => {
    if (!newBenefit.trim()) return;
    setBenefits([...benefits, { id: Date.now().toString(), text: newBenefit.trim() }]);
    setNewBenefit('');
  };
  const updateBenefit = (id: string, val: string) => setBenefits(benefits.map(b => b.id === id ? { ...b, text: val } : b));
  const removeBenefit = (id: string) => setBenefits(benefits.filter(b => b.id !== id));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sections = [
        {
          id: 'hero', type: 'Hero',
          title: heroTitle, subtitle: heroSubtitle, bgImage: heroBgUrl,
          props: {
            ctaText: heroCtaText,
            chips: heroChips.split('\n').map(s => s.trim()).filter(Boolean),
            trustIndicators: trustIndicators.filter(t => t.value && t.label),
          }
        },
        {
          id: 'countdown', type: 'Countdown',
          props: {
            targetDate: countdownDate || undefined,
            tickerLines: tickerText.split('\n').map(s => s.trim()).filter(Boolean),
            slotsTotal,
            platform: countdownPlatform,
          }
        },
        {
          id: 'topics', type: 'Topics',
          props: {
            topics: topics.map(t => ({ title: t.title, description: t.desc }))
          }
        },
        {
          id: 'mentor', type: 'MentorProfile',
          props: {
            mentorName, mentorTitle, mentorDesc,
            imageUrl: mentorImageUrl || undefined,
            stats: mentorStats.filter(s => s.value && s.label),
          }
        },
        {
          id: 'benefits', type: 'Benefits',
          title: 'Tại Sao Chọn Chúng Tôi',
          items: benefits.map(b => b.text)
        },
        { id: 'lead-form', type: 'LeadForm', title: formTitle }
      ];

      const themeConfig = { primaryColor };
      await api.createIBLandingPage({ title, slug, seoDescription, sections, themeConfig });

      // Reset all
      setTitle(''); setSlug(''); setSeoDescription('');
      setPrimaryColor('#F46D00');
      setHeroTitle('Đầu Tư Thông Minh Cùng Bạc Môn'); setHeroSubtitle('Hệ thống hỗ trợ giao dịch chuyên nghiệp...');
      setHeroBgUrl(''); setHeroCtaText('Đăng Ký Nhận Link Ngay');
      setHeroChips('Tư duy giao dịch\nPhân tích kỹ thuật\nQuản lý vốn');
      setTrustIndicators([{ value: '1,000+', label: 'Trader đã tham gia hệ thống' }, { value: '100%', label: 'Miễn phí hoàn toàn' }]);
      setCountdownDate(''); setTickerText('CHÚ Ý: KHÔNG PHÁT LẠI SAU KHI KẾT THÚC'); setSlotsTotal(1000);
      setCountdownPlatform('Zoom (link gửi qua Zalo sau khi đăng ký)');
      setMentorName('Hải Anh'); setMentorTitle('★ Top KOL Forex Việt Nam');
      setMentorDesc('Trader & Mentor chuyên Vàng, Forex với hơn 8 năm thực chiến...');
      setMentorImageUrl('');
      setMentorStats([{ value: '8+ năm', label: 'Kinh nghiệm' }, { value: '300K+', label: 'Theo dõi' }, { value: '8+', label: 'Chủ đề' }]);
      setBenefits([{ id: '1', text: 'Tín hiệu phân tích chuẩn mỗi ngày' }]);
      setFormTitle('Đăng Ký Nhận Tư Vấn Miễn Phí');
      setShowCreate(false); setActiveTab('general');
      fetchPages();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const copyUrl = (slugName: string, id: string) => {
    const url = `https://haianhne26.github.io/B-C-M-N-HUB/#/p/${slugName}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string, pageTitle: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa Landing Page "${pageTitle}" không? Các Leads liên quan sẽ bị xóa.`)) {
      try {
        await api.deleteIBLandingPage(id);
        fetchPages();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const tabStyle = (id: string): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '8px',
    background: activeTab === id ? 'var(--primary-color)' : 'rgba(255,255,255,0.04)',
    color: activeTab === id ? 'white' : 'var(--text-secondary)',
    border: activeTab === id ? 'none' : '1px solid var(--border-subtle)',
    cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem', whiteSpace: 'nowrap' as const,
    transition: 'all 0.2s',
  });

  const sectionLabel: React.CSSProperties = {
    fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
    color: 'var(--primary-color)', marginBottom: '16px', marginTop: '24px',
  };

  const helper: React.CSSProperties = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Landing Builder</h2>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Thiết kế Landing Page "Aurora Glass" và tùy biến 100% nội dung
          </div>
        </div>
        <button className="btn-desk btn-desk-primary" onClick={() => { setShowCreate(!showCreate); setActiveTab('general'); }}>
          {showCreate ? 'Hủy' : <><Plus size={16} /> Tạo Landing Page mới</>}
        </button>
      </div>

      {showCreate && (
        <div className="app-card" style={{ marginBottom: '24px', border: '1px solid var(--primary-color)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '20px' }}>✦ Thiết lập trang đích mới</h3>
          <form onSubmit={handleCreate}>

            {/* Tab Bar */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', overflowX: 'auto', paddingBottom: '4px', flexWrap: 'wrap' }}>
              {[
                { id: 'general', label: 'Cơ bản', icon: <Settings size={14} /> },
                { id: 'theme', label: 'Giao diện', icon: <Palette size={14} /> },
                { id: 'hero', label: 'Hero Section', icon: <LayoutTemplate size={14} /> },
                { id: 'countdown', label: 'Sự kiện', icon: <Clock size={14} /> },
                { id: 'mentor', label: 'Mentor', icon: <User size={14} /> },
                { id: 'topics', label: 'Lộ trình', icon: <CheckSquare size={14} /> },
                { id: 'benefits', label: 'Lợi ích & Form', icon: <CheckSquare size={14} /> },
              ].map(tab => (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id as any)} style={tabStyle(tab.id)}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* ─── Tab: General ─── */}
            {activeTab === 'general' && (
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Tiêu đề trang *</label>
                    <input type="text" className="form-input" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Nhập Môn Trader 2026 cùng Hải Anh" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Slug (URL) *</label>
                    <input type="text" className="form-input" value={slug} onChange={e => setSlug(e.target.value)} required placeholder="nhap-mon-trader-2026" />
                    <div style={helper}>👉 Link sẽ là: /p/<strong>{slug || 'slug-cua-ban'}</strong></div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Mô tả ngắn (SEO Meta Description)</label>
                  <textarea className="form-input" rows={2} value={seoDescription} onChange={e => setSeoDescription(e.target.value)} placeholder="Tham gia Livestream miễn phí về Trading cùng Hải Anh..." />
                </div>
              </div>
            )}

            {/* ─── Tab: Theme ─── */}
            {activeTab === 'theme' && (
              <div style={{ display: 'grid', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Màu chủ đạo (Neon Accent Color)</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                      style={{ width: '56px', height: '56px', padding: '4px', cursor: 'pointer', border: '1px solid var(--border-subtle)', borderRadius: '10px', background: 'transparent' }} />
                    <input type="text" className="form-input" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} style={{ width: '130px' }} />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Ảnh hưởng đến tất cả: Nút bấm, Viền sáng, Gradient text, Ticker...</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                    {['#F46D00', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'].map(c => (
                      <button key={c} type="button" onClick={() => setPrimaryColor(c)}
                        style={{ width: '32px', height: '32px', borderRadius: '8px', background: c, border: primaryColor === c ? '3px solid white' : '2px solid transparent', cursor: 'pointer' }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─── Tab: Hero ─── */}
            {activeTab === 'hero' && (
              <div style={{ display: 'grid', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Tiêu đề chính (H1) *</label>
                  <input type="text" className="form-input" value={heroTitle} onChange={e => setHeroTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phụ đề (Subtitle) *</label>
                  <textarea className="form-input" rows={2} value={heroSubtitle} onChange={e => setHeroSubtitle(e.target.value)} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Text Nút CTA chính</label>
                    <input type="text" className="form-input" value={heroCtaText} onChange={e => setHeroCtaText(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ảnh nền Hero (URL)</label>
                    <input type="url" className="form-input" value={heroBgUrl} onChange={e => setHeroBgUrl(e.target.value)} placeholder="https://..." />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Nhãn dán (Chips) — mỗi dòng 1 chip</label>
                  <textarea className="form-input" rows={3} value={heroChips} onChange={e => setHeroChips(e.target.value)} />
                </div>

                <p style={sectionLabel}>📊 Thông số Tín nhiệm (Trust Indicators)</p>
                {trustIndicators.map((t, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '10px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                    <input type="text" className="form-input" placeholder='VD: "1,000+"' value={t.value} onChange={e => updateTrustIndicator(idx, 'value', e.target.value)} style={{ margin: 0 }} />
                    <input type="text" className="form-input" placeholder='VD: "Trader đã tham gia"' value={t.label} onChange={e => updateTrustIndicator(idx, 'label', e.target.value)} style={{ margin: 0 }} />
                    <button type="button" onClick={() => removeTrustIndicator(idx)} style={{ padding: '8px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#EF4444', cursor: 'pointer' }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addTrustIndicator} className="btn-desk btn-desk-secondary" style={{ alignSelf: 'flex-start' }}>
                  <Plus size={14} /> Thêm chỉ số
                </button>
              </div>
            )}

            {/* ─── Tab: Countdown ─── */}
            {activeTab === 'countdown' && (
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Ngày & giờ diễn ra sự kiện</label>
                    <input type="datetime-local" className="form-input" value={countdownDate} onChange={e => setCountdownDate(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tổng số slot đăng ký</label>
                    <input type="number" className="form-input" value={slotsTotal} onChange={e => setSlotsTotal(Number(e.target.value))} min={1} />
                    <div style={helper}>Slot thực tế = số lead đã đăng ký / tổng slot này</div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Nền tảng / Địa điểm diễn ra</label>
                  <input type="text" className="form-input" value={countdownPlatform} onChange={e => setCountdownPlatform(e.target.value)} placeholder="VD: Zoom, Youtube Live, Facebook..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Nội dung Ticker chạy ngang (mỗi dòng 1 thông báo)</label>
                  <textarea className="form-input" rows={4} value={tickerText} onChange={e => setTickerText(e.target.value)} />
                  <div style={helper}>Các dòng này sẽ lặp lại trong thanh thông báo chạy ngang phía trên</div>
                </div>
              </div>
            )}

            {/* ─── Tab: Mentor ─── */}
            {activeTab === 'mentor' && (
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Tên Mentor / Diễn giả *</label>
                    <input type="text" className="form-input" value={mentorName} onChange={e => setMentorName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Chức danh / Slogan</label>
                    <input type="text" className="form-input" value={mentorTitle} onChange={e => setMentorTitle(e.target.value)} placeholder="★ Top KOL Forex Việt Nam" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Link ảnh Mentor (URL)</label>
                  <input type="url" className="form-input" value={mentorImageUrl} onChange={e => setMentorImageUrl(e.target.value)} placeholder="https://... (để trống dùng ảnh placeholder)" />
                </div>
                <div className="form-group">
                  <label className="form-label">Mô tả dài (Bio)</label>
                  <textarea className="form-input" rows={4} value={mentorDesc} onChange={e => setMentorDesc(e.target.value)} />
                </div>

                <p style={sectionLabel}>📈 Chỉ số nổi bật của Mentor</p>
                {mentorStats.map((s, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '10px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                    <input type="text" className="form-input" placeholder='VD: "8+ năm"' value={s.value} onChange={e => updateMentorStat(idx, 'value', e.target.value)} style={{ margin: 0 }} />
                    <input type="text" className="form-input" placeholder='VD: "Kinh nghiệm thực chiến"' value={s.label} onChange={e => updateMentorStat(idx, 'label', e.target.value)} style={{ margin: 0 }} />
                    <button type="button" onClick={() => removeMentorStat(idx)} style={{ padding: '8px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#EF4444', cursor: 'pointer' }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addMentorStat} className="btn-desk btn-desk-secondary" style={{ alignSelf: 'flex-start' }}>
                  <Plus size={14} /> Thêm chỉ số
                </button>
              </div>
            )}

            {/* ─── Tab: Topics ─── */}
            {activeTab === 'topics' as any && (
              <div style={{ display: 'grid', gap: '20px' }}>
                <p style={{ ...sectionLabel, marginTop: 0 }}>📚 Lộ trình / Nội dung chi tiết</p>
                {topics.map((t) => (
                  <div key={t.id} style={{ display: 'grid', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input type="text" className="form-input" value={t.title} onChange={e => setTopics(topics.map(x => x.id === t.id ? { ...x, title: e.target.value } : x))} placeholder="Tiêu đề (VD: Buổi 1...)" style={{ margin: 0, flex: 1 }} />
                      <button type="button" className="btn-desk btn-desk-secondary" onClick={() => setTopics(topics.filter(x => x.id !== t.id))} style={{ padding: '0 12px' }}>
                        <X size={16} />
                      </button>
                    </div>
                    <textarea className="form-input" value={t.desc} onChange={e => setTopics(topics.map(x => x.id === t.id ? { ...x, desc: e.target.value } : x))} placeholder="Mô tả chi tiết nội dung..." style={{ margin: 0, height: '60px' }} />
                  </div>
                ))}
                <button type="button" className="btn-desk btn-desk-secondary" onClick={() => setTopics([...topics, { id: Date.now().toString(), title: '', desc: '' }])}>
                  + Thêm nội dung lộ trình
                </button>
              </div>
            )}

            {/* ─── Tab: Benefits & Form ─── */}
            {activeTab === 'benefits' && (
              <div style={{ display: 'grid', gap: '20px' }}>
                <p style={{ ...sectionLabel, marginTop: 0 }}>✅ Danh sách lợi ích / quyền lợi</p>
                {benefits.map((b) => (
                  <div key={b.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text" className="form-input"
                      value={b.text} onChange={e => updateBenefit(b.id, e.target.value)}
                      placeholder="Nhập nội dung lợi ích..."
                      style={{ margin: 0 }}
                    />
                    <button type="button" onClick={() => removeBenefit(b.id)} style={{ padding: '8px 10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#EF4444', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px' }}>
                  <input type="text" className="form-input" value={newBenefit} onChange={e => setNewBenefit(e.target.value)}
                    placeholder="Nhập lợi ích mới và nhấn Thêm..." style={{ margin: 0 }}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addBenefit(); } }}
                  />
                  <button type="button" onClick={addBenefit} className="btn-desk btn-desk-secondary">
                    <Plus size={14} /> Thêm
                  </button>
                </div>

                <p style={sectionLabel}>📝 Form Đăng Ký</p>
                <div className="form-group">
                  <label className="form-label">Tiêu đề Form Đăng ký</label>
                  <input type="text" className="form-input" value={formTitle} onChange={e => setFormTitle(e.target.value)} required />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                💡 Bạn có thể chuyển qua lại giữa các tab trước khi lưu
              </div>
              <button type="submit" className="btn-desk btn-desk-primary" style={{ padding: '12px 28px', fontSize: '0.9375rem' }}>
                ✦ Tạo & Xuất bản Landing Page
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pages List */}
      {pages.length === 0 && !showCreate && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Globe size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p style={{ fontWeight: 600 }}>Chưa có Landing Page nào</p>
          <p style={{ fontSize: '0.875rem', marginTop: '8px' }}>Bấm "Tạo Landing Page mới" để bắt đầu</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {pages.map((p) => (
          <div key={p.id} className="app-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <h4 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>{p.title}</h4>
              <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: 700, background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', flexShrink: 0 }}>
                ONLINE
              </span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#A78BFA', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>
              /p/{p.slug}
            </div>
            {p.seoDescription && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {p.seoDescription}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {p._count?.leads || 0} Lead đã đăng ký
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  className="btn-desk btn-desk-secondary btn-desk-sm"
                  onClick={() => window.open(`https://haianhne26.github.io/B-C-M-N-HUB/#/p/${p.slug}`, '_blank')}
                  title="Xem trang"
                  style={{ padding: '0 8px' }}
                >
                  <ExternalLink size={13} />
                </button>
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
                  title="Sao chép link"
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
