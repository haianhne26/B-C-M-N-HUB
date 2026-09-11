import React from 'react';

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
    <section className="band">
      <div className="shl">
        
        <div className="shead center">
          <div className="eyebrow"><span className="sq"></span> {title}</div>
          <h2 className="h2">{subtitle}</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {topics.map((topic, idx) => (
            <div key={idx} className="feat glass" style={{ 
              padding: '28px 24px', 
              transition: 'all 0.3s ease',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 140, 40, 0.4)';
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--bd)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 20px 50px -24px rgba(0,0,0,0.7)';
            }}
            >
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'rgba(255, 255, 255, 0.05)', marginBottom: '12px', lineHeight: 1, textShadow: '0 0 20px rgba(255,140,40,0.2)' }}>
                {(idx + 1).toString().padStart(2, '0')}
              </div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--tx)', marginBottom: '12px' }}>
                {topic.title}
              </h4>
              <p style={{ fontSize: '0.9375rem', color: 'var(--tx2)', lineHeight: 1.6, margin: 0 }}>
                {topic.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
