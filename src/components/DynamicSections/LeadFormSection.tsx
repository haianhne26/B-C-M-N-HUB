import React, { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

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
      <section style={{ padding: '80px 20px', background: '#11101D', textAlign: 'center' }} id="lead-form">
        <div style={{ maxWidth: '500px', margin: '0 auto', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10B981', padding: '40px', borderRadius: '16px' }}>
          <CheckCircle color="#10B981" size={64} style={{ margin: '0 auto 24px' }} />
          <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '16px' }}>Đăng Ký Thành Công!</h3>
          <p style={{ color: '#A78BFA' }}>Cảm ơn bạn đã quan tâm. Đội ngũ Bạc Môn HUB sẽ liên hệ lại trong thời gian sớm nhất.</p>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: '80px 20px', background: '#11101D', display: 'flex', flexDirection: 'column', alignItems: 'center' }} id="lead-form">
      <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '40px', color: '#fff', textAlign: 'center' }}>
        {title}
      </h2>
      
      <form onSubmit={handleSubmit} style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(124, 58, 237, 0.3)',
        padding: '40px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '500px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#E5E7EB', fontSize: '0.875rem' }}>Họ và tên *</label>
          <input 
            type="text" 
            required 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #374151', background: '#1F2937', color: '#fff', fontSize: '1rem' }}
            placeholder="Nhập họ tên của bạn"
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#E5E7EB', fontSize: '0.875rem' }}>Số điện thoại *</label>
          <input 
            type="tel" 
            required 
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
            style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #374151', background: '#1F2937', color: '#fff', fontSize: '1rem' }}
            placeholder="0912345678"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#E5E7EB', fontSize: '0.875rem' }}>Email</label>
          <input 
            type="email" 
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #374151', background: '#1F2937', color: '#fff', fontSize: '1rem' }}
            placeholder="example@gmail.com"
          />
        </div>

        {status === 'error' && (
          <div style={{ color: '#EF4444', fontSize: '0.875rem', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>
            Có lỗi xảy ra, vui lòng thử lại sau.
          </div>
        )}

        <button 
          type="submit" 
          disabled={status === 'loading'}
          style={{
            background: 'linear-gradient(to right, #7C3AED, #3B82F6)',
            color: 'white',
            border: 'none',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '1.125rem',
            fontWeight: 700,
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '10px',
            opacity: status === 'loading' ? 0.7 : 1
          }}
        >
          {status === 'loading' ? 'Đang gửi...' : <><Send size={20} /> Gửi Đăng Ký</>}
        </button>
      </form>
    </section>
  );
};
