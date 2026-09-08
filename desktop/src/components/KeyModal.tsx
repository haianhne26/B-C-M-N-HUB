import React, { useState } from 'react';
import { api } from '../services/api';
import { Key, CheckCircle, X } from 'lucide-react';

interface KeyModalProps {
  onClose: () => void;
  onActivated: (keyInfo: any) => void;
}

export const KeyModal: React.FC<KeyModalProps> = ({ onClose, onActivated }) => {
  const [keyCode, setKeyCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await api.activateKey(keyCode);
      setSuccess(res.message);
      setTimeout(() => {
        onActivated(res.data);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Kích hoạt không thành công');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(124, 58, 237, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C4B5FD' }}>
            <Key size={22} />
          </div>
          <div>
            <h3 className="modal-title" style={{ margin: 0 }}>Kích hoạt License KEY</h3>
            <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Mở khóa toàn bộ quyền sử dụng dịch vụ</span>
          </div>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', borderRadius: '8px', color: '#FCA5A5', fontSize: '0.8125rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', borderRadius: '8px', color: '#6EE7B7', fontSize: '0.8125rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        <form onSubmit={handleActivate}>
          <div className="form-group">
            <label className="form-label">Mã License KEY (Ví dụ: BMH-XXXX-XXXX-XXXX)</label>
            <input
              type="text"
              className="form-input"
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
              placeholder="BMH-PRO8-9921-ABCD"
              value={keyCode}
              onChange={(e) => setKeyCode(e.target.value)}
              required
            />
          </div>

          <div style={{ fontSize: '0.8125rem', color: '#9CA3AF', marginBottom: '20px', lineHeight: 1.5 }}>
            * KEY cấp quyền sử dụng các module: MT5 Dashboard, Bạc Môn AI, Khóa học Premium và Lịch kinh tế theo chính sách của Admin/IB.
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-desk btn-desk-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-desk btn-desk-primary" disabled={loading}>
              {loading ? 'Đang kiểm tra...' : 'Kích hoạt ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
