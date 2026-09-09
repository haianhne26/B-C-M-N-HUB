import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  bgImage?: string;
  onCtaClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ title, subtitle, bgImage, onCtaClick }) => {
  return (
    <section className="dynamic-hero" style={{
      padding: '100px 20px 60px',
      textAlign: 'center',
      background: bgImage 
        ? `linear-gradient(135deg, rgba(17,16,29,0.85) 0%, rgba(27,26,48,0.95) 100%), url(${bgImage}) center/cover no-repeat`
        : 'linear-gradient(135deg, rgba(17,16,29,1) 0%, rgba(27,26,48,1) 100%)',
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      borderBottom: '1px solid rgba(124, 58, 237, 0.2)'
    }}>
      <h1 style={{
        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
        fontWeight: 800,
        marginBottom: '24px',
        background: 'linear-gradient(to right, #fff, #A78BFA)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        maxWidth: '800px',
        lineHeight: 1.2
      }}>
        {title}
      </h1>
      <p style={{
        fontSize: '1.125rem',
        color: '#9CA3AF',
        marginBottom: '40px',
        maxWidth: '600px',
        lineHeight: 1.6
      }}>
        {subtitle}
      </p>
      <button 
        onClick={onCtaClick}
        style={{
          background: 'linear-gradient(to right, #7C3AED, #3B82F6)',
          color: 'white',
          border: 'none',
          padding: '16px 32px',
          borderRadius: '8px',
          fontSize: '1.125rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 10px 25px rgba(124, 58, 237, 0.3)',
          transition: 'transform 0.2s'
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        Đăng Ký Ngay <ArrowRight size={20} />
      </button>
    </section>
  );
};
