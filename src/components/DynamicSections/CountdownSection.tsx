import React, { useState, useEffect } from 'react';
import { Calendar, Users } from 'lucide-react';

interface CountdownSectionProps {
  title?: string;
  targetDate?: string; // ISO format or string parsable by Date
  slotsTotal?: number;
  slotsBooked?: number;
  platform?: string;
}

export const CountdownSection: React.FC<CountdownSectionProps> = ({
  title = 'LỊCH PHÁT SÓNG',
  targetDate = new Date(Date.now() + 86400000 * 3).toISOString(), // Mặc định 3 ngày sau
  slotsTotal = 1000,
  slotsBooked = 667,
  platform = 'Hệ thống Bạc Môn Hub'
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
    
    // Format display
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

  const slotsAvailable = Math.max(0, slotsTotal - slotsBooked);
  const progressPercent = Math.min(100, Math.round((slotsBooked / slotsTotal) * 100));

  return (
    <section style={{ padding: '60px 20px', background: '#0B0A14' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#A78BFA', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Calendar size={24} /> {title}
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          
          {/* Card Left: Countdown */}
          <div style={{ 
            background: 'linear-gradient(145deg, rgba(30, 27, 50, 0.6) 0%, rgba(15, 13, 25, 0.8) 100%)', 
            border: '1px solid rgba(124, 58, 237, 0.2)',
            borderRadius: '16px',
            padding: '30px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: '#7C3AED', filter: 'blur(60px)', opacity: 0.3 }}></div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }}></div>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#10B981', letterSpacing: '1px' }}>SẮP DIỄN RA</span>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{dateDisplay}</div>
              <div style={{ fontSize: '1.125rem', color: '#A78BFA' }}>{timeDisplay}</div>
            </div>

            {/* Countdown Boxes */}
            <div style={{ display: 'flex', gap: '15px' }}>
              {[
                { label: 'Ngày', value: timeLeft.days },
                { label: 'Giờ', value: timeLeft.hours },
                { label: 'Phút', value: timeLeft.minutes },
                { label: 'Giây', value: timeLeft.seconds }
              ].map((item, idx) => (
                <div key={idx} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    borderRadius: '8px', 
                    padding: '12px 0',
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    color: '#fff',
                    marginBottom: '8px',
                    fontVariantNumeric: 'tabular-nums'
                  }}>
                    {item.value.toString().padStart(2, '0')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card Right: Slots Info */}
          <div style={{ 
            background: 'linear-gradient(145deg, rgba(30, 27, 50, 0.6) 0%, rgba(15, 13, 25, 0.8) 100%)', 
            border: '1px solid rgba(124, 58, 237, 0.2)',
            borderRadius: '16px',
            padding: '30px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <Users size={24} color="#A78BFA" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>Số lượng có hạn</h3>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
                <span style={{ color: '#E5E7EB' }}>Đã đăng ký: <strong>{slotsBooked}</strong></span>
                <span style={{ color: '#9CA3AF' }}>Tổng: {slotsTotal}</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, #7C3AED, #4F46E5)', width: `${progressPercent}%`, borderRadius: '4px' }}></div>
              </div>
              <div style={{ textAlign: 'right', marginTop: '8px', fontSize: '0.875rem', color: '#10B981', fontWeight: 600 }}>
                Còn lại {slotsAvailable} chỗ
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9375rem' }}>
                <span style={{ color: '#9CA3AF' }}>Nền tảng</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{platform}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem' }}>
                <span style={{ color: '#9CA3AF' }}>Chi phí</span>
                <span style={{ color: '#10B981', fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>Miễn phí 100%</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
