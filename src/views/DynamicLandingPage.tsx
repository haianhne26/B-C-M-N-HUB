import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { HeroSection } from '../components/DynamicSections/HeroSection';
import { BenefitsSection } from '../components/DynamicSections/BenefitsSection';
import { LeadFormSection } from '../components/DynamicSections/LeadFormSection';
import { CountdownSection } from '../components/DynamicSections/CountdownSection';
import { TopicsSection } from '../components/DynamicSections/TopicsSection';
import { MentorProfileSection } from '../components/DynamicSections/MentorProfileSection';
import '../styles/aurora-theme.css';

interface ThemeConfig {
  primaryColor?: string;
}

const parseThemeConfig = (value: unknown): ThemeConfig | null => {
  let parsed = value;
  // Older records may contain JSON that was serialized more than once.
  for (let attempt = 0; attempt < 2 && typeof parsed === 'string'; attempt += 1) {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return null;
    }
  }
  return parsed && typeof parsed === 'object' ? parsed as ThemeConfig : null;
};

const hexToRgb = (color: string) => {
  const hex = color.replace('#', '');
  if (!/^[\da-f]{6}$/i.test(hex)) return null;
  return [0, 2, 4].map(offset => Number.parseInt(hex.slice(offset, offset + 2), 16));
};

const mix = (source: number[], target: number, amount: number) =>
  source.map(channel => Math.round(channel + (target - channel) * amount));

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
          
          // Increment click count (fire-and-forget)
          if (result.data.id) {
            fetch(`${apiUrl}/ib/landing-pages/${result.data.id}/click`, { method: 'POST' }).catch(() => {});
          }

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

  // Hooks must run in exactly the same order while the page is loading and
  // after its data arrives. Keep this before every conditional return.
  const themeStyles = useMemo(() => {
    const primaryColor = parseThemeConfig(data?.themeConfig)?.primaryColor;
    const rgb = primaryColor ? hexToRgb(primaryColor) : null;
    if (!rgb || !primaryColor) return {};

    const [lightR, lightG, lightB] = mix(rgb, 255, 0.28);
    const [deepR, deepG, deepB] = mix(rgb, 0, 0.26);
    const [softR, softG, softB] = mix(rgb, 255, 0.12);
    return {
      '--ink': primaryColor,
      '--ink-2': `rgb(${lightR}, ${lightG}, ${lightB})`,
      '--ink-deep': `rgb(${deepR}, ${deepG}, ${deepB})`,
      '--glow': `rgba(${rgb.join(', ')}, 0.45)`,
      '--aura-strong': `rgba(${rgb.join(', ')}, 0.50)`,
      '--aura-medium': `rgba(${softR}, ${softG}, ${softB}, 0.42)`,
      '--aura-soft': `rgba(${rgb.join(', ')}, 0.16)`,
    } as React.CSSProperties;
  }, [data?.themeConfig]);

  const sections = data?.sections || [];
  const countdownSection = sections.find((section: any) => section.type === 'Countdown');
  const leadCount = Number.isFinite(Number(data?.leadCount)) ? Math.max(0, Number(data.leadCount)) : 0;

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
    <div className="bhx bhx-hn" style={themeStyles}>
      {/* Background Aura */}
      <div className="bhx-aura">
        <div className="vig"></div>
      </div>
      
      {/* Header with Logo */}
      <header style={{ 
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50, 
        padding: '20px', display: 'flex', justifyContent: 'center' 
      }}>
        <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="Bạc Môn Đạo" style={{ height: '60px', width: '60px', objectFit: 'contain', borderRadius: '50%' }} />
      </header>

      {/* Dynamic Sections Renderer */}
      {sections.map((section: any) => {
        switch (section.type) {
          case 'Hero':
            return (
              <HeroSection 
                key={section.id} 
                title={section.title} 
                subtitle={section.subtitle} 
                bgImage={section.bgImage}
                ctaText={section.props?.ctaText}
                chips={section.props?.chips}
                trustIndicators={section.props?.trustIndicators}
                onCtaClick={scrollToForm}
                schedule={countdownSection ? (
                  <CountdownSection
                    {...(countdownSection.props || {})}
                    embedded
                    slotsBooked={leadCount}
                  />
                ) : undefined}
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
            return null;
          case 'Topics':
            return <TopicsSection key={section.id} {...section.props} />;
          case 'MentorProfile':
            return <MentorProfileSection key={section.id} {...section.props} />;
          default:
            return null;
        }
      })}

      {/* Basic Footer */}
      <footer style={{ position: 'relative', zIndex: 1, padding: '40px 20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ color: 'var(--tx3)', fontSize: '0.875rem' }}>
          Được cung cấp bởi Bạc Môn HUB &copy; {new Date().getFullYear()}
        </p>
        <p style={{ color: 'var(--tx3)', opacity: 0.6, fontSize: '0.75rem', marginTop: '8px' }}>
          Đối tác: {data.ib?.fullName}
        </p>
      </footer>
    </div>
  );
};
