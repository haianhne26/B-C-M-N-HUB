import React from 'react';
import { siteConfig } from '../config/site';
import { LineChart, ShieldCheck, Wrench, Layout, Radio, RefreshCw } from 'lucide-react';

export const Features: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'chart':
        return <LineChart size={24} />;
      case 'shield':
        return <ShieldCheck size={24} />;
      case 'tools':
        return <Wrench size={24} />;
      case 'interface':
        return <Layout size={24} />;
      case 'realtime':
        return <Radio size={24} />;
      case 'update':
        return <RefreshCw size={24} />;
      default:
        return <LineChart size={24} />;
    }
  };

  return (
    <section id="features" className="section-wrapper">
      <div className="container">
        <div className="section-header">
          <div className="section-eyebrow">Tính năng cốt lõi</div>
          <h2>{siteConfig.featuresTitle}</h2>
          <p>{siteConfig.featuresSubtitle}</p>
        </div>

        <div className="features-grid">
          {siteConfig.features.map((feature) => (
            <div key={feature.id} className="feature-card">
              <div className="feature-card-header">
                <div className="feature-icon-box">
                  {getIcon(feature.iconName)}
                </div>
                <span className="feature-number">{feature.number}</span>
              </div>
              <h3 className="feature-card-title">{feature.title}</h3>
              <p className="feature-card-desc">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
