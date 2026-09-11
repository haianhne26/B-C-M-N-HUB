import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface BenefitsSectionProps {
  title: string;
  items: string[];
}

export const BenefitsSection: React.FC<BenefitsSectionProps> = ({ title, items }) => {
  return (
    <section className="band">
      <div className="shl">
        <div className="shead center">
          <div className="eyebrow"><span className="sq"></span> QUYỀN LỢI TẶNG KÈM</div>
          <h2 className="h2">{title}</h2>
        </div>
        
        <div className="how">
          {items.map((item, idx) => (
            <div key={idx} className="card">
              <div className="n"><CheckCircle2 size={24} color="var(--ink)" /></div>
              <p style={{ fontSize: '1.05rem', color: 'var(--tx)', fontWeight: 600, lineHeight: 1.5 }}>
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
