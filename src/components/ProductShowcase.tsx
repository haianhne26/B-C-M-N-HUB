import React, { useState } from 'react';
import { siteConfig } from '../config/site';
import { Monitor, BarChart2, ShieldAlert, Check } from 'lucide-react';

export const ProductShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState(siteConfig.showcaseTabs[0].id);

  const currentTabInfo = siteConfig.showcaseTabs.find((t) => t.id === activeTab) || siteConfig.showcaseTabs[0];

  return (
    <section id="showcase" className="section-wrapper bg-secondary">
      <div className="container">
        <div className="section-header">
          <div className="section-eyebrow">Trải nghiệm sản phẩm</div>
          <h2>{siteConfig.showcaseTitle}</h2>
          <p>{siteConfig.showcaseSubtitle}</p>
        </div>

        {/* Tab Controls */}
        <div className="showcase-tabs">
          {siteConfig.showcaseTabs.map((tab) => (
            <button
              key={tab.id}
              className={`showcase-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Showcase Main Display */}
        <div className="showcase-display">
          <div className="showcase-preview-content">
            <div className="showcase-meta-bar">
              <div>
                <div className="showcase-meta-title">{currentTabInfo.title}</div>
                <div className="showcase-meta-desc">{currentTabInfo.description}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontSize: '0.8125rem' }}>
                <Check size={16} />
                <span>Chuẩn hóa trực quan</span>
              </div>
            </div>

            {/* Visual Workspace Render */}
            <div style={{ padding: '36px 24px', background: '#090810', minHeight: '380px' }}>
              {activeTab === 'dashboard' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  <div style={{ background: '#141322', padding: '20px', borderRadius: '12px', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#A78BFA', marginBottom: '12px' }}>
                      <Monitor size={18} />
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Market Overview</span>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Tổng quan chỉ số & Cặp tiền</div>
                    <p style={{ color: '#9CA3AF', fontSize: '0.8125rem', lineHeight: 1.6 }}>
                      Theo dõi biến động đa khung thời gian của Vàng (XAU), Ngoại hối và Chỉ số. Tự động nhận diện xu hướng chủ đạo.
                    </p>
                    <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ padding: '4px 10px', background: 'rgba(124, 58, 237, 0.15)', color: '#C4B5FD', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Trend Filter</span>
                      <span style={{ padding: '4px 10px', background: 'rgba(16, 185, 129, 0.15)', color: '#6EE7B7', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>High Volatility</span>
                    </div>
                  </div>

                  <div style={{ background: '#141322', padding: '20px', borderRadius: '12px', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#A78BFA', marginBottom: '12px' }}>
                      <BarChart2 size={18} />
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Watchlist & Signals</span>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Lọc danh mục tức thời</div>
                    <p style={{ color: '#9CA3AF', fontSize: '0.8125rem', lineHeight: 1.6 }}>
                      Tổng hợp các tài sản có điểm hội tụ kỹ thuật đẹp nhất trong phiên. Hạn chế vào lệnh cảm tính.
                    </p>
                    <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ padding: '4px 10px', background: 'rgba(124, 58, 237, 0.15)', color: '#C4B5FD', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Multi-Timeframe</span>
                      <span style={{ padding: '4px 10px', background: 'rgba(16, 185, 129, 0.15)', color: '#6EE7B7', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Zero Lag</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'chart' && (
                <div style={{ background: '#12111E', padding: '28px', borderRadius: '16px', border: '1px solid rgba(124, 58, 237, 0.25)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.125rem', color: '#FFFFFF' }}>BTC/USDT</span>
                      <span style={{ padding: '2px 8px', background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>+4.25%</span>
                    </div>
                    <span style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>Khung H1 • Bạc Môn Advanced Engine</span>
                  </div>
                  <div style={{ height: '160px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="100%" height="100%" viewBox="0 0 600 120" fill="none">
                      <path d="M0,80 Q 150,20 300,70 T 600,15" stroke="#7C3AED" strokeWidth="3" fill="none" />
                      <path d="M0,80 Q 150,20 300,70 T 600,15 L 600,120 L 0,120 Z" fill="url(#tabChartGrad)" opacity="0.25" />
                      <defs>
                        <linearGradient id="tabChartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7C3AED" />
                          <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
              )}

              {activeTab === 'panel' && (
                <div style={{ background: '#12111E', padding: '28px', borderRadius: '16px', border: '1px solid rgba(124, 58, 237, 0.25)', maxWidth: '600px', margin: '0 auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#EF4444', marginBottom: '16px' }}>
                    <ShieldAlert size={20} />
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: '#FFFFFF' }}>Bảng tính rủi ro & Khối lượng (Risk Calculator)</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#1B1A2C', borderRadius: '8px' }}>
                      <span style={{ color: '#9CA3AF' }}>Mức chịu rủi ro mỗi lệnh</span>
                      <span style={{ color: '#FFFFFF', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>1.0% ($100.00)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#1B1A2C', borderRadius: '8px' }}>
                      <span style={{ color: '#9CA3AF' }}>Khối lượng Lot đề xuất</span>
                      <span style={{ color: '#10B981', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>0.25 Lots</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#1B1A2C', borderRadius: '8px' }}>
                      <span style={{ color: '#9CA3AF' }}>Tỷ lệ Lời : Lỗ (Risk:Reward)</span>
                      <span style={{ color: '#C4B5FD', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>1 : 3.5</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
