import React from 'react';
import { BookOpen } from 'lucide-react';

interface Topic {
  title: string;
  description: string;
}

interface TopicsSectionProps {
  title?: string;
  subtitle?: string;
  topics?: Topic[];
}

export const TopicsSection: React.FC<TopicsSectionProps> = ({
  title = 'NỘI DUNG BUỔI LIVE',
  subtitle = 'Bạn sẽ học được gì?',
  topics = [
    { title: 'Nghề trading là gì?', description: 'Bức tranh thật về nghề trading — ưu điểm, nhược điểm và những hiểu lầm phổ biến của người mới.' },
    { title: 'Forex là gì?', description: 'Kiến thức căn bản nhất về thị trường ngoại hối: cách vận hành, thuật ngữ, những thứ bắt buộc phải biết.' },
    { title: 'Phân tích & tư duy thắng', description: 'Làm sao để phân tích thị trường và xây tư duy giao dịch có kỷ luật thay vì đoán mò.' },
    { title: 'Nền tảng phân tích kỹ thuật', description: 'Những viên gạch đầu tiên của phân tích kỹ thuật — đọc biểu đồ, xu hướng, vùng giá quan trọng.' },
    { title: 'Tận dụng công nghệ', description: 'Cách dùng công nghệ để phân tích nhanh và chính xác hơn, tiết kiệm thời gian cho người bận.' },
    { title: 'Công cụ độc quyền', description: 'Giới thiệu công cụ hỗ trợ phân tích thật sự — không phải "hàng mì ăn liền", minh bạch cách hoạt động.' },
    { title: 'Quản lý vốn', description: 'Bài học sống còn giúp bạn ở lại thị trường: quản trị rủi ro và bảo vệ tài khoản.' },
    { title: 'Lộ trình tự học', description: 'Roadmap tự học từng bước cho người mới — và định hướng phát triển dài hạn.' },
  ]
}) => {
  return (
    <section style={{ padding: '80px 20px', background: '#0B0A14' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px', color: '#10B981', fontWeight: 700, letterSpacing: '2px', fontSize: '0.875rem' }}>
            <BookOpen size={18} /> {title}
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            {subtitle}
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {topics.map((topic, idx) => (
            <div key={idx} style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '24px',
              transition: 'all 0.3s ease',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(124, 58, 237, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.3)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'rgba(124, 58, 237, 0.2)', marginBottom: '12px', lineHeight: 1 }}>
                {(idx + 1).toString().padStart(2, '0')}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
                {topic.title}
              </h3>
              <p style={{ fontSize: '0.9375rem', color: '#9CA3AF', lineHeight: 1.6, margin: 0 }}>
                {topic.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
