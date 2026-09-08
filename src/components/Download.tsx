import React from 'react';
import { siteConfig } from '../config/site';
import { Download, Laptop, Apple, Smartphone, CheckCircle, Clock } from 'lucide-react';

export const DownloadSection: React.FC = () => {
  const { downloadSection, downloadUrl } = siteConfig;

  const getPlatformIcon = (iconType: string) => {
    switch (iconType) {
      case 'windows':
        return <Laptop size={26} />;
      case 'apple':
        return <Apple size={26} />;
      case 'android':
        return <Smartphone size={26} />;
      default:
        return <Laptop size={26} />;
    }
  };

  return (
    <section id="download" className="section-wrapper">
      <div className="container">
        <div className="download-card-hero">
          <div className="section-eyebrow">Tải phần mềm</div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', color: 'var(--color-text)' }}>
            {downloadSection.heading}
          </h2>
          <p style={{ maxWidth: '640px', margin: '0 auto 36px auto', fontSize: '1.0625rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            {downloadSection.description}
          </p>

          {/* Main Download Button */}
          <div>
            <a
              href={downloadUrl}
              className="btn btn-primary btn-lg"
              style={{ padding: '18px 40px', fontSize: '1.125rem', borderRadius: 'var(--radius-xl)' }}
            >
              <Download size={22} />
              {downloadSection.buttonText}
            </a>
          </div>

          {/* Platform Options */}
          <div className="download-platforms-grid">
            {downloadSection.platforms.map((platform, idx) => (
              <div
                key={idx}
                className={`platform-box ${platform.available ? 'primary-platform' : ''}`}
              >
                <div className="platform-icon-wrap">
                  {getPlatformIcon(platform.icon)}
                </div>
                <h4 className="platform-name">{platform.name}</h4>
                <div className={`platform-badge ${platform.available ? 'active' : 'coming-soon'}`}>
                  {platform.badge}
                </div>
                <p className="platform-desc">{platform.description}</p>
                {platform.available ? (
                  <a
                    href={platform.url}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '10px', fontSize: '0.875rem' }}
                  >
                    <Download size={16} />
                    Tải bản Windows
                  </a>
                ) : (
                  <button
                    disabled
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '0.875rem',
                      background: '#F4F4F5',
                      color: '#A1A1AA',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Clock size={14} />
                    Sắp phát hành
                  </button>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={14} color="#10B981" /> Cài đặt nhanh chóng
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={14} color="#10B981" /> Không kèm phần mềm bên thứ 3
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={14} color="#10B981" /> Quản lý liên kết qua config
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
