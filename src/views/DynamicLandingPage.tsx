import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { HeroSection } from '../components/DynamicSections/HeroSection';
import { BenefitsSection } from '../components/DynamicSections/BenefitsSection';
import { LeadFormSection } from '../components/DynamicSections/LeadFormSection';
import { CountdownSection } from '../components/DynamicSections/CountdownSection';
import { TopicsSection } from '../components/DynamicSections/TopicsSection';
import { MentorProfileSection } from '../components/DynamicSections/MentorProfileSection';

export const DynamicLandingPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://bacmonhub-backend.onrender.com/api';
        const res = await fetch(`${apiUrl}/p/${slug}`);
        const result = await res.json();
        if (result.success && result.data) {
          setData(result.data);
          if (result.data.title) {
            document.title = result.data.title;
          }
          if (result.data.seoDescription) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
              metaDesc.setAttribute('content', result.data.seoDescription);
            }
          }
        } else {
          setError('Không tìm thấy trang đích.');
        }
      } catch (err) {
        setError('Lỗi kết nối máy chủ.');
      } finally {
        setLoading(false);
      }
    };
    if (slug) {
      fetchPageData();
    }
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0B0A14', color: '#fff' }}>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0B0A14', color: '#EF4444' }}>
        <p>{error || 'Trang không tồn tại.'}</p>
      </div>
    );
  }

  const scrollToForm = () => {
    document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0B0A14', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header with Logo */}
      <header style={{ 
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50, 
        padding: '20px', display: 'flex', justifyContent: 'center' 
      }}>
        <img src="/logo.png" alt="Bạc Môn Đạo" style={{ height: '60px', objectFit: 'contain' }} />
      </header>

      {/* Dynamic Sections Renderer */}
      {data.sections?.map((section: any) => {
        switch (section.type) {
          case 'Hero':
            return (
              <HeroSection 
                key={section.id} 
                title={section.title} 
                subtitle={section.subtitle} 
                bgImage={section.bgImage}
                onCtaClick={scrollToForm}
              />
            );
          case 'Benefits':
            return (
              <BenefitsSection 
                key={section.id} 
                title={section.title} 
                items={section.items || []} 
              />
            );
          case 'LeadForm':
            return (
              <LeadFormSection 
                key={section.id} 
                title={section.title} 
                pageSlug={slug || ''}
              />
            );
          case 'Countdown':
            return <CountdownSection key={section.id} {...section.props} />;
          case 'Topics':
            return <TopicsSection key={section.id} {...section.props} />;
          case 'MentorProfile':
            return <MentorProfileSection key={section.id} {...section.props} />;
          default:
            return null;
        }
      })}

      {/* Basic Footer */}
      <footer style={{ padding: '40px 20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
          Được cung cấp bởi Bạc Môn HUB &copy; {new Date().getFullYear()}
        </p>
        <p style={{ color: '#6B7280', fontSize: '0.75rem', marginTop: '8px' }}>
          Đối tác: {data.ib?.fullName}
        </p>
      </footer>
    </div>
  );
};
