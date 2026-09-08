import React from 'react';
import { siteConfig } from '../config/site';
import { Download, ArrowRight } from 'lucide-react';

export const FinalCTA: React.FC = () => {
  return (
    <section className="section-wrapper" style={{ paddingBottom: '96px' }}>
      <div className="container">
        <div className="final-cta-card">
          <div className="final-cta-glow"></div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h2 className="final-cta-heading">{siteConfig.finalCta.heading}</h2>
            <p className="final-cta-subheading">{siteConfig.finalCta.subheading}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <a
                href="#download"
                className="btn btn-primary btn-lg"
                style={{
                  background: '#7C3AED',
                  boxShadow: '0 8px 24px rgba(124, 58, 237, 0.45)',
                  borderRadius: 'var(--radius-full)',
                  padding: '16px 36px'
                }}
              >
                <Download size={18} />
                {siteConfig.finalCta.buttonText}
                <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
