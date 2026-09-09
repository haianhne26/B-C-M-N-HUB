import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface BenefitsSectionProps {
  title: string;
  items: string[];
}

export const BenefitsSection: React.FC<BenefitsSectionProps> = ({ title, items }) => {
  return (
    <section style={{
      padding: '80px 20px',
      background: '#0B0A14',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <h2 style={{
        fontSize: '2.5rem',
        fontWeight: 700,
        marginBottom: '48px',
        color: '#fff',
        textAlign: 'center'
      }}>
        {title}
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        width: '100%',
        maxWidth: '1000px'
      }}>
        {items.map((item, idx) => (
          <div key={idx} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '24px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            transition: 'transform 0.2s, background 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
          >
            <CheckCircle2 color="#10B981" size={28} style={{ flexShrink: 0 }} />
            <span style={{ color: '#E5E7EB', fontSize: '1.125rem', lineHeight: 1.5 }}>
              {item}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
