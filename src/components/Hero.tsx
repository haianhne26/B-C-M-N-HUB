import React from 'react';
import { siteConfig } from '../config/site';
import { Download, ChevronRight, CheckCircle2, Sparkles } from 'lucide-react';
import { HeroScene } from './ThreeCanvas/HeroScene';

export const Hero: React.FC = () => {
  return (
    <section id="hero" className="hero-section">
      <div className="bg-glow-subtle"></div>
      <div className="container">
        <div className="hero-grid">
          {/* Left Column: Copy & CTAs */}
          <div className="hero-content">
            <div className="hero-eyebrow">
              <Sparkles size={14} />
              {siteConfig.siteName}
            </div>

            <h1 className="hero-title">
              {siteConfig.heroHeading}
              <span className="highlight">{siteConfig.heroHighlight}</span>
            </h1>

            <p className="hero-subtitle">
              {siteConfig.description}
            </p>

            <div className="hero-actions">
              <a href="#download" className="btn btn-primary btn-lg">
                <Download size={18} />
                Tải phần mềm
              </a>
              <a href="#features" className="btn btn-secondary btn-lg">
                Khám phá tính năng
                <ChevronRight size={18} />
              </a>
            </div>

            <div className="hero-badge-note">
              <CheckCircle2 size={15} color="#10B981" />
              <span>Hỗ trợ Windows 64-bit • Tối ưu hiệu năng cao</span>
            </div>
          </div>

          {/* Right Column: High Fidelity 3D Scene */}
          <div className="hero-mockup-col hero-3d-col">
            <HeroScene />
          </div>
        </div>
      </div>
    </section>
  );
};
