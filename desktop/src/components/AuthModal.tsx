import React, { useState } from 'react';
import { api } from '../services/api';
import { Zap, LogIn, UserPlus } from 'lucide-react';

interface AuthModalProps {
  onSuccess: (userData: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let data;
      if (isRegister) {
        data = await api.register(email, password, fullName, phone);
      } else {
        data = await api.login(email, password);
      }
      onSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Đăng nhập không thành công');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (accEmail: string, accPass: string) => {
    setError(null);
    setLoading(true);
    try {
      const data = await api.login(accEmail, accPass);
      onSuccess(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img 
            src="/logo.jpg?v=2" 
            alt="Bạc Môn Đạo" 
            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'contain', border: '1px solid var(--border-subtle)', margin: '0 auto 16px auto', display: 'block' }} 
          />
          <h3 className="modal-title" style={{ color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 800 }}>BẠC MÔN ĐẠO</h3>
          <p className="modal-desc" style={{ color: 'var(--text-secondary)' }}>
            {isRegister ? 'Đăng ký tài khoản trader mới' : 'Đăng nhập vào hệ thống Desktop Platform'}
          </p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', borderRadius: '8px', color: '#FCA5A5', fontSize: '0.8125rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className="form-group">
                <label className="form-label">Họ và tên</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="0912345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="trader@bacmonhub.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-desk btn-desk-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : isRegister ? (
              <><UserPlus size={16} /> Đăng ký ngay</>
            ) : (
              <><LogIn size={16} /> Đăng nhập</>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(null); }}
            style={{ background: 'transparent', border: 'none', color: '#A78BFA', fontSize: '0.8125rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isRegister ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký ngay'}
          </button>
        </div>

        {/* Demo Fast Login Buttons */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'center' }}>
            Đăng nhập nhanh tài khoản mẫu:
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn-desk btn-desk-secondary btn-desk-sm"
              style={{ flex: 1 }}
              onClick={() => handleQuickLogin('owner@bacmonhub.com', 'Owner@123456')}
            >
              👑 OWNER
            </button>
            <button
              type="button"
              className="btn-desk btn-desk-secondary btn-desk-sm"
              style={{ flex: 1 }}
              onClick={() => handleQuickLogin('ib@bacmonhub.com', 'Ib@123456')}
            >
              🤝 IB Partner
            </button>
            <button
              type="button"
              className="btn-desk btn-desk-secondary btn-desk-sm"
              style={{ flex: 1 }}
              onClick={() => handleQuickLogin('user@bacmonhub.com', 'User@123456')}
            >
              📈 USER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
