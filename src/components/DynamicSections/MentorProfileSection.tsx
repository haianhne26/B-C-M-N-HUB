import React from 'react';
import { Star, TrendingUp, Users, BookOpen } from 'lucide-react';

interface MentorStat {
  label: string;
  value: string;
}

interface MentorProfileSectionProps {
  title?: string;
  mentorName?: string;
  mentorTitle?: string;
  mentorDesc?: string;
  imageUrl?: string;
  stats?: MentorStat[];
}

export const MentorProfileSection: React.FC<MentorProfileSectionProps> = ({
  title = 'NGƯỜI ĐỨNG LỚP',
  mentorName = 'Hải Anh',
  mentorTitle = '★ Top KOL Forex Việt Nam',
  mentorDesc = 'Trader & Mentor chuyên Vàng, Forex với hơn 8 năm thực chiến và 5+ năm đào tạo trực tiếp trên thị trường. Theo đuổi phương pháp giao dịch nhất quán và kỷ luật.',
  imageUrl = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800',
  stats = [
    { label: 'Kinh nghiệm', value: '8+ năm' },
    { label: 'Theo dõi', value: '300K+' },
    { label: 'Chủ đề', value: '8+' },
  ]
}) => {
  // Use a placeholder if no image is provided
  const finalImageUrl = imageUrl && imageUrl.trim() !== '' 
    ? imageUrl 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(mentorName)}&background=10B981&color=fff&size=512`;

  const getIconForStat = (index: number) => {
    switch (index % 3) {
      case 0: return <TrendingUp size={18} color="var(--ink-2)" />;
      case 1: return <Users size={18} color="var(--ink-2)" />;
      case 2: return <BookOpen size={18} color="var(--ink-2)" />;
      default: return <Star size={18} color="var(--ink-2)" />;
    }
  };

  return (
    <section className="band">
      <div className="shl">
        <div className="shead center">
          <div className="eyebrow"><span className="sq"></span> {title}</div>
          <h2 className="h2">{mentorName} <span className="em">là ai?</span></h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 400px) 1fr', gap: '32px', alignItems: 'stretch' }}>
          
          {/* Cột trái: Ảnh và Plate */}
          <div style={{ position: 'relative', borderRadius: '22px', overflow: 'hidden', border: '1px solid var(--bd)', background: '#0A0710', minHeight: '100%' }}>
            <img src={finalImageUrl} alt={mentorName} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: '400px' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,7,16,0.1) 30%, rgba(10,7,16,0.9) 100%)' }}></div>
            <div style={{ position: 'absolute', top: '14px', left: '14px', zIndex: 2, display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.05em', color: '#fff', background: 'rgba(10,7,16,0.62)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: '8px', backdropFilter: 'blur(10px)' }}>
              <span className="d" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--ink)', boxShadow: '0 0 10px var(--glow)', animation: 'bhxPulse 1.6s ease-in-out infinite' }}></span> LIVE MENTOR
            </div>
            <div style={{ position: 'absolute', left: '18px', right: '18px', bottom: '15px', zIndex: 2 }}>
              <div style={{ fontSize: '23px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{mentorName}</div>
              <div style={{ fontSize: '12.5px', color: 'var(--ink-2)', fontWeight: 700, marginTop: '3px' }}>{mentorTitle}</div>
            </div>
          </div>

          {/* Cột phải: Thông tin */}
          <div className="card" style={{ padding: '36px' }}>
            <div className="eyebrow" style={{ marginBottom: '16px' }}><Star size={14} color="var(--ink-2)" /> TRADER & MENTOR</div>
            <h3 style={{ fontSize: '1.75rem', marginBottom: '16px' }}>Về <span className="em">{mentorName}</span></h3>
            
            <p className="sub" style={{ fontSize: '15px', lineHeight: 1.7, marginBottom: '36px', maxWidth: '100%' }}>
              {mentorDesc}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
              {stats && stats.map((stat, idx) => (
                <div key={idx} className="glass" style={{ padding: '16px', borderRadius: '16px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', display: 'grid', placeItems: 'center', marginBottom: '12px', border: '1px solid var(--bd)' }}>
                    {getIconForStat(idx)}
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--tx)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '4px' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--tx3)', fontWeight: 600 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
