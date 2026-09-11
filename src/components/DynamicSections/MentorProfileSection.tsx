import React from 'react';
import { Star, Award, TrendingUp, Users } from 'lucide-react';

interface MentorProfileSectionProps {
  title?: string;
  mentorName?: string;
  mentorTitle?: string;
  mentorDesc?: string;
  imageUrl?: string;
  stats?: { label: string; value: string; icon: React.ReactNode }[];
}

export const MentorProfileSection: React.FC<MentorProfileSectionProps> = ({
  title = 'NGƯỜI ĐỨNG LỚP',
  mentorName = 'Hải Anh',
  mentorTitle = '★ Top KOL Forex Việt Nam',
  mentorDesc = 'Trader & Mentor chuyên Vàng, Forex với hơn 8 năm thực chiến và 5+ năm đào tạo trực tiếp trên thị trường. Theo đuổi phương pháp giao dịch nhất quán và kỷ luật.',
  imageUrl = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800', // Placeholder
  stats = [
    { label: 'Kinh nghiệm thực chiến', value: '8+ năm', icon: <TrendingUp size={20} color="#A78BFA" /> },
    { label: 'Người theo dõi', value: '300K+', icon: <Users size={20} color="#A78BFA" /> },
    { label: 'Chủ đề', value: '8+', icon: <BookOpen size={20} color="#A78BFA" /> },
  ]
}) => {
  return (
    <section style={{ padding: '80px 20px', background: '#0B0A14' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px', color: '#10B981', fontWeight: 700, letterSpacing: '2px', fontSize: '0.875rem' }}>
            <Star size={18} /> {title}
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            {mentorName} là ai?
          </h2>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '40px',
          alignItems: 'center',
          background: 'linear-gradient(145deg, rgba(30, 27, 50, 0.4) 0%, rgba(15, 13, 25, 0.6) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '24px',
          padding: '40px'
        }}>
          
          {/* Avatar Image */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '10%', left: '10%', width: '80%', height: '80%', background: '#7C3AED', filter: 'blur(80px)', opacity: 0.3, zIndex: 0 }}></div>
            <img 
              src={imageUrl} 
              alt={mentorName} 
              style={{ 
                width: '100%', 
                maxWidth: '400px', 
                height: 'auto', 
                aspectRatio: '1', 
                objectFit: 'cover', 
                borderRadius: '20px',
                border: '2px solid rgba(124, 58, 237, 0.3)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                position: 'relative',
                zIndex: 1
              }} 
            />
          </div>

          {/* Info */}
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(124, 58, 237, 0.1)', color: '#A78BFA', padding: '6px 16px', borderRadius: '30px', fontSize: '0.875rem', fontWeight: 700, marginBottom: '16px' }}>
              TRADER & MENTOR
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
              {mentorName}
            </h3>
            <div style={{ fontSize: '1.125rem', color: '#10B981', fontWeight: 600, marginBottom: '24px' }}>
              {mentorTitle}
            </div>
            
            <p style={{ fontSize: '1.0625rem', color: '#D1D5DB', lineHeight: 1.7, marginBottom: '32px' }}>
              <strong style={{ color: '#fff' }}>{mentorName}</strong> — {mentorDesc}
            </p>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '20px' }}>
              {stats.map((stat, idx) => (
                <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ marginBottom: '8px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>{stat.value}</div>
                  <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

// Cần import BookOpen nếu dùng trong stats mặc định
import { BookOpen } from 'lucide-react';
