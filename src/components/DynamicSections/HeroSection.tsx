import React from 'react';
import { ArrowRight } from 'lucide-react';

interface TrustIndicator {
  value: string;
  label: string;
}

interface HeroSectionProps {
  title: string;
  subtitle: string;
  bgImage?: string;
  ctaText?: string;
  chips?: string[];
  trustIndicators?: TrustIndicator[];
  onCtaClick?: () => void;
  schedule?: React.ReactNode;
}

const defaultChips = ['Tư duy giao dịch', 'Phân tích kỹ thuật', 'Quản lý vốn'];
const defaultTrust: TrustIndicator[] = [
  { value: '1,000+', label: 'Trader đã tham gia hệ thống Bạc Môn Hub' },
  { value: '100%', label: 'Miễn phí hoàn toàn cho người mới' },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  bgImage,
  ctaText = 'Đăng Ký Ngay',
  chips = defaultChips,
  trustIndicators = defaultTrust,
  onCtaClick,
  schedule,
}) => {
  return (
    <section
      className="hero band"
      style={
        bgImage 
        ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', textAlign: 'center', paddingTop: '100px', paddingBottom: '60px' } 
        : { textAlign: 'center', paddingTop: '100px', paddingBottom: '60px' }
      }
    >
      <div className="shl" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="display" style={{ margin: '0 0 16px 0', fontSize: '3.5rem', lineHeight: 1.1 }}>{title}</h1>
        <p className="sub" style={{ marginBottom: schedule ? '24px' : '40px', fontSize: '1.25rem' }}>{subtitle}</p>

        {schedule}

        <div className="hero-cta" style={{ display: 'flex', justifyContent: 'center', gap: '16px', margin: schedule ? '28px 0 32px' : '0 0 40px' }}>
          <button className="btn btn-pri" onClick={onCtaClick}>
            {ctaText} <ArrowRight size={18} />
          </button>
        </div>

        {chips.length > 0 && (
          <div className="qf" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '40px' }}>
            <span className="lbl" style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>Nội dung gồm:</span>
            {chips.map((chip, i) => (
              <span key={i} className="chip">{chip}</span>
            ))}
          </div>
        )}

        {trustIndicators.length > 0 && (
          <div className="hero-trust" style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
            {trustIndicators.map((t, i) => (
              <div key={i} className="ht" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="n" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                  {t.value.endsWith('+') || t.value.endsWith('%')
                    ? <>{t.value.slice(0, -1)}<span className="u" style={{ color: 'var(--ink)' }}>{t.value.slice(-1)}</span></>
                    : t.value}
                </div>
                <div className="k" style={{ fontSize: '0.875rem', color: 'var(--tx3)' }}>{t.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
