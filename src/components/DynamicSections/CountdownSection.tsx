import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';

interface CountdownSectionProps {
  title?: string;
  targetDate?: string;
  slotsTotal?: number;
  slotsBooked?: number;
  platform?: string;
  tickerLines?: string[];
  embedded?: boolean;
}

export const CountdownSection: React.FC<CountdownSectionProps> = ({
  title = 'LỊCH PHÁT SÓNG',
  targetDate = new Date(Date.now() + 86400000 * 3).toISOString(),
  slotsTotal = 1000,
  slotsBooked = 0,
  platform = 'Hệ thống Bạc Môn Hub',
  tickerLines = ['CHÚ Ý: KHÔNG PHÁT LẠI SAU KHI KẾT THÚC', 'ĐẶT CHỖ NGAY ĐỂ KHÔNG BỎ LỠ'],
  embedded = false,
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [dateDisplay, setDateDisplay] = useState('');
  const [timeDisplay, setTimeDisplay] = useState('');

  useEffect(() => {
    const target = new Date(targetDate);
    
    setDateDisplay(target.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' }));
    setTimeDisplay(target.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }));

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = target.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const safeSlotsTotal = Math.max(1, Number(slotsTotal) || 1);
  const safeSlotsBooked = Math.max(0, Number(slotsBooked) || 0);
  const slotsAvailable = Math.max(0, safeSlotsTotal - safeSlotsBooked);
  const progressPercent = Math.min(100, Math.round((safeSlotsBooked / safeSlotsTotal) * 100));

  const content = (
    <>
      {/* Ticker bar */}
      <div className="ticker">
        <div className="live">
          <span className="d"></span> TRỰC TIẾP TRÊN {platform.toUpperCase()}
        </div>
        <div className="track">
          {/* Loop lines multiple times to fill ticker */}
          {[...Array(6)].map((_, i) => (
            <React.Fragment key={i}>
              {tickerLines.map((line, j) => (
                <div key={`tk-${i}-${j}`} className="tk">{line}</div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="shl" style={{ marginTop: embedded ? '20px' : '32px', marginBottom: embedded ? 0 : '64px' }}>
        {!embedded && <div className="shead center" style={{ marginBottom: '32px' }}>
          <div className="eyebrow" style={{ display: 'inline-flex', justifyContent: 'center' }}>
            <span className="sq"></span> {title}
          </div>
        </div>}

        <div className="cta" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          
          {/* Card Left: Countdown */}
          <div className="box tg">
            <div className="eyebrow" style={{ marginBottom: '24px' }}>
              <span className="d" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--ok)', boxShadow: '0 0 10px var(--ok)', animation: 'bhxPulse 1.6s ease-in-out infinite' }}></span>
              <span style={{ color: 'var(--ok)' }}>THỜI GIAN CÒN LẠI</span>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--tx)', marginBottom: '8px' }}>{dateDisplay}</div>
              <div style={{ fontSize: '1.125rem', color: 'var(--ink-2)' }}>{timeDisplay}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {[
                { label: 'Ngày', value: timeLeft.days },
                { label: 'Giờ', value: timeLeft.hours },
                { label: 'Phút', value: timeLeft.minutes },
                { label: 'Giây', value: timeLeft.seconds }
              ].map((item, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--bd-2)', borderRadius: '12px', padding: '16px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--tx)', lineHeight: 1 }}>
                    {item.value.toString().padStart(2, '0')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--tx3)', marginTop: '8px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em' }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card Right: Slots */}
          <div className="box ib">
            <div className="eyebrow" style={{ marginBottom: '24px' }}>
              <Users size={16} color="var(--ink-2)" /> TÌNH TRẠNG CHỖ NGỒI
            </div>
            
            <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>Đã đăng ký <span className="em">{safeSlotsBooked}</span> / {safeSlotsTotal}</h3>
            <p className="sub" style={{ marginBottom: '32px' }}>
              Chỉ còn lại <strong style={{ color: 'var(--tx)' }}>{slotsAvailable}</strong> chỗ trống. Phòng sẽ khóa khi đủ số lượng để đảm bảo chất lượng đường truyền.
            </p>

            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '999px', height: '14px', overflow: 'hidden', border: '1px solid var(--bd)' }}>
              <div style={{ 
                height: '100%', 
                width: `${progressPercent}%`, 
                background: 'linear-gradient(90deg, var(--ink), var(--ink-2))',
                borderRadius: '999px',
                boxShadow: '0 0 14px var(--glow)',
                transition: 'width 1s ease-in-out'
              }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.875rem', color: 'var(--tx3)', fontWeight: 600 }}>
              <span>Đã lấp đầy</span>
              <span style={{ color: 'var(--ink-2)' }}>{progressPercent}%</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );

  return embedded ? <div className="hero-schedule">{content}</div> : <section className="band">{content}</section>;
};
