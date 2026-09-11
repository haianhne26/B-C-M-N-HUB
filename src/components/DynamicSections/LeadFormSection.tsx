import React, { useState } from 'react';
import { Send, CheckCircle, ShieldCheck } from 'lucide-react';

interface LeadFormSectionProps {
  title: string;
  pageSlug: string;
}

export const LeadFormSection: React.FC<LeadFormSectionProps> = ({ title, pageSlug }) => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://bacmonhub-backend.onrender.com/api';
      const res = await fetch(`${apiUrl}/leads/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageSlug,
          fullName: formData.name,
          phone: formData.phone,
          email: formData.email
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <section className="band" id="lead-form">
        <div className="shl" style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '40px', textAlign: 'center', borderColor: 'var(--ok)' }}>
            <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', background: 'radial-gradient(circle at 50% 50%, rgba(74, 222, 154, 0.1), transparent 70%)', pointerEvents: 'none' }}></div>
            <CheckCircle color="var(--ok)" size={64} style={{ margin: '0 auto 24px', filter: 'drop-shadow(0 0 12px rgba(74, 222, 154, 0.5))' }} />
            <h3 style={{ color: 'var(--tx)', fontSize: '1.75rem', marginBottom: '16px', fontWeight: 800 }}>Đăng Ký Thành Công!</h3>
            <p className="sub" style={{ margin: '0 auto' }}>Cảm ơn bạn đã quan tâm. Đội ngũ Bạc Môn HUB sẽ liên hệ lại trong thời gian sớm nhất để hỗ trợ.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="band" id="lead-form">
      <div className="shl">
        <div className="shead center">
          <div className="eyebrow"><span className="sq"></span> GIỮ CHỖ NGAY</div>
          <h2 className="h2">{title}</h2>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <form onSubmit={handleSubmit} className="card" style={{
            padding: '40px',
            width: '100%',
            maxWidth: '500px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}>
            <div style={{ position: 'absolute', top: '10%', right: '-10%', width: '120%', height: '120%', background: 'radial-gradient(circle at 80% 20%, rgba(255, 140, 40, 0.1), transparent 50%)', pointerEvents: 'none', zIndex: 0 }}></div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <label style={{ display: 'block', marginBottom: '10px', color: 'var(--tx2)', fontSize: '0.875rem', fontWeight: 700 }}>Họ và tên *</label>
              <input 
                type="text" 
                required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                style={{ 
                  width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--bd-2)', 
                  background: 'rgba(0,0,0,0.4)', color: 'var(--tx)', fontSize: '1rem', outline: 'none',
                  transition: 'border-color 0.3s'
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--ink)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--bd-2)'}
                placeholder="Nhập họ tên của bạn"
              />
            </div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <label style={{ display: 'block', marginBottom: '10px', color: 'var(--tx2)', fontSize: '0.875rem', fontWeight: 700 }}>Số điện thoại (Zalo) *</label>
              <input 
                type="tel" 
                required 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                style={{ 
                  width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--bd-2)', 
                  background: 'rgba(0,0,0,0.4)', color: 'var(--tx)', fontSize: '1rem', outline: 'none',
                  transition: 'border-color 0.3s'
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--ink)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--bd-2)'}
                placeholder="0912 345 678"
              />
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <label style={{ display: 'block', marginBottom: '10px', color: 'var(--tx2)', fontSize: '0.875rem', fontWeight: 700 }}>Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                style={{ 
                  width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--bd-2)', 
                  background: 'rgba(0,0,0,0.4)', color: 'var(--tx)', fontSize: '1rem', outline: 'none',
                  transition: 'border-color 0.3s'
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--ink)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--bd-2)'}
                placeholder="email@example.com"
              />
            </div>

            {status === 'error' && (
              <div style={{ color: '#fb7185', fontSize: '0.875rem', marginTop: '-10px', position: 'relative', zIndex: 1 }}>
                Có lỗi xảy ra, vui lòng thử lại!
              </div>
            )}

            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="btn btn-pri"
              style={{ width: '100%', marginTop: '8px', zIndex: 1, padding: '18px' }}
            >
              {status === 'loading' ? 'Đang xử lý...' : (
                <>Hoàn Tất Đăng Ký <Send size={18} /></>
              )}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12px', color: 'var(--tx3)', marginTop: '8px', zIndex: 1 }}>
              <ShieldCheck size={14} /> Thông tin của bạn được bảo mật tuyệt đối
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
