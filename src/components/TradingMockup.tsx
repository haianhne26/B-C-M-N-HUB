import React from 'react';
import { TrendingUp, ShieldCheck, Activity } from 'lucide-react';

export const TradingMockup: React.FC = () => {
  return (
    <div className="mockup-wrapper animate-float">
      <div className="mockup-window">
        {/* Title bar */}
        <div className="mockup-titlebar">
          <div className="mockup-dots">
            <span className="mockup-dot red"></span>
            <span className="mockup-dot yellow"></span>
            <span className="mockup-dot green"></span>
          </div>
          <div className="mockup-title">
            <Activity size={14} color="#7C3AED" />
            BẠC MÔN HUB — Terminal v1.0
          </div>
          <div className="mockup-status">
            ● LIVE STREAM
          </div>
        </div>

        {/* Mockup Body */}
        <div className="mockup-body">
          {/* Main Panel */}
          <div className="mockup-main-panel">
            {/* Ticker Bar */}
            <div className="mockup-ticker-bar">
              <div className="ticker-name">
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#7C3AED', display: 'inline-block' }}></span>
                XAU/USD (Gold)
                <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 500 }}>• M15</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span className="ticker-price">2,748.50</span>
                <span className="ticker-change">+1.42%</span>
              </div>
            </div>

            {/* Trading Chart SVG */}
            <div className="mockup-chart-area">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9CA3AF' }}>
                <span>Indicator: BacMon Dynamic Channel & Trend EMA</span>
                <span style={{ color: '#10B981', fontWeight: 600 }}>LONG BIAS</span>
              </div>

              {/* Chart SVG with realistic candles and purple gradient area */}
              <svg className="chart-svg" viewBox="0 0 420 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="60%" stopColor="#A78BFA" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="0" y1="25" x2="420" y2="25" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="420" y2="60" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="0" y1="95" x2="420" y2="95" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

                {/* Shaded Area under trend */}
                <path
                  d="M0,90 Q 50,85 100,75 T 200,60 T 300,35 T 420,15 L 420,120 L 0,120 Z"
                  fill="url(#chartGradient)"
                />

                {/* Trend line */}
                <path
                  d="M0,90 Q 50,85 100,75 T 200,60 T 300,35 T 420,15"
                  fill="none"
                  stroke="url(#lineGrad)"
                  strokeWidth="2.5"
                />

                {/* Candle bars simulation */}
                {/* 1 */}
                <line x1="35" y1="78" x2="35" y2="98" stroke="#EF4444" strokeWidth="1" />
                <rect x="32" y="82" width="6" height="12" rx="1" fill="#EF4444" />
                {/* 2 */}
                <line x1="75" y1="70" x2="75" y2="92" stroke="#10B981" strokeWidth="1" />
                <rect x="72" y="74" width="6" height="14" rx="1" fill="#10B981" />
                {/* 3 */}
                <line x1="120" y1="62" x2="120" y2="85" stroke="#10B981" strokeWidth="1" />
                <rect x="117" y="65" width="6" height="15" rx="1" fill="#10B981" />
                {/* 4 */}
                <line x1="170" y1="60" x2="170" y2="78" stroke="#EF4444" strokeWidth="1" />
                <rect x="167" y="64" width="6" height="8" rx="1" fill="#EF4444" />
                {/* 5 */}
                <line x1="220" y1="45" x2="220" y2="68" stroke="#10B981" strokeWidth="1" />
                <rect x="217" y="48" width="6" height="16" rx="1" fill="#10B981" />
                {/* 6 */}
                <line x1="275" y1="32" x2="275" y2="55" stroke="#10B981" strokeWidth="1" />
                <rect x="272" y="35" width="6" height="15" rx="1" fill="#10B981" />
                {/* 7 */}
                <line x1="335" y1="22" x2="335" y2="45" stroke="#10B981" strokeWidth="1" />
                <rect x="332" y="25" width="6" height="14" rx="1" fill="#10B981" />
                {/* 8 - Current pulsing point */}
                <line x1="395" y1="10" x2="395" y2="30" stroke="#10B981" strokeWidth="1" />
                <rect x="392" y="12" width="6" height="12" rx="1" fill="#10B981" />
                <circle cx="395" cy="15" r="4" fill="#7C3AED" />
                <circle cx="395" cy="15" r="8" stroke="#7C3AED" strokeWidth="1.5" opacity="0.6" />
              </svg>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#6B7280', fontFamily: 'var(--font-mono)' }}>
                <span>09:00</span>
                <span>12:00</span>
                <span>15:00</span>
                <span>18:00</span>
                <span>21:00</span>
                <span>NOW</span>
              </div>
            </div>
          </div>

          {/* Right Side Panel: Risk & Execution */}
          <div className="mockup-side-panel">
            <div className="side-card">
              <div className="side-card-title">Quản lý rủi ro (Risk)</div>
              <div className="risk-metric">
                <span>R:R Ratio</span>
                <span style={{ color: '#10B981' }}>1 : 3.2</span>
              </div>
              <div className="risk-metric">
                <span>Stop Loss</span>
                <span style={{ color: '#EF4444' }}>-0.85%</span>
              </div>
              <div className="risk-metric">
                <span>Take Profit</span>
                <span style={{ color: '#10B981' }}>+2.72%</span>
              </div>
              <div className="risk-metric">
                <span>Max Drawdown</span>
                <span>&lt; 2.0%</span>
              </div>
            </div>

            <div className="side-card">
              <div className="side-card-title">Trạng thái vị thế</div>
              <div style={{ fontSize: '0.75rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                <TrendingUp size={14} /> Tối ưu Entry
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#9CA3AF', marginTop: 4 }}>
                Bảo vệ vốn tự động theo thuật toán Bạc Môn
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Badge */}
      <div className="floating-badge">
        <div className="floating-badge-icon">
          <ShieldCheck size={20} />
        </div>
        <div>
          <div className="floating-badge-title">Kiểm soát rủi ro thông minh</div>
          <div className="floating-badge-sub">Bảo vệ tài khoản giao dịch</div>
        </div>
      </div>
    </div>
  );
};
