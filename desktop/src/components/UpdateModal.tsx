import React from 'react';
import { DownloadCloud, AlertTriangle, CheckCircle } from 'lucide-react';

interface UpdateModalProps {
  currentVersion: string;
  updateData: {
    version: string;
    downloadUrl: string;
    releaseNotes: string;
    releaseDate: string;
    isMandatory: boolean;
  };
  onClose: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  currentVersion,
  updateData,
  onClose
}) => {
  const handleUpdateNow = () => {
    window.open(updateData.downloadUrl, '_blank');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: 520 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            background: updateData.isMandatory ? 'rgba(239, 68, 68, 0.2)' : 'rgba(124, 58, 237, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: updateData.isMandatory ? '#EF4444' : '#C4B5FD'
          }}>
            {updateData.isMandatory ? <AlertTriangle size={24} /> : <DownloadCloud size={24} />}
          </div>
          <div>
            <h3 className="modal-title" style={{ margin: 0 }}>
              {updateData.isMandatory ? 'Cập nhật bắt buộc' : 'Có phiên bản mới của Bạc Môn HUB'}
            </h3>
            <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
              Phiên bản hiện tại: v{currentVersion} → Mới: <strong style={{ color: '#C4B5FD' }}>v{updateData.version}</strong>
            </div>
          </div>
        </div>

        {updateData.isMandatory && (
          <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', borderRadius: '8px', color: '#FCA5A5', fontSize: '0.8125rem', marginBottom: '16px' }}>
            ⚠️ Đây là bản cập nhật quan trọng. Bạn cần cập nhật để tiếp tục sử dụng hệ thống.
          </div>
        )}

        <div style={{ background: '#0F0E1C', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '6px' }}>
            Nội dung cập nhật (Release Notes):
          </div>
          <div style={{ fontSize: '0.875rem', color: '#FFFFFF', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
            {updateData.releaseNotes}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          {!updateData.isMandatory && (
            <button type="button" className="btn-desk btn-desk-secondary" onClick={onClose}>
              Để sau
            </button>
          )}
          <button
            type="button"
            className="btn-desk btn-desk-primary"
            onClick={handleUpdateNow}
            style={{ padding: '10px 24px' }}
          >
            <DownloadCloud size={16} />
            Cập nhật ngay
          </button>
        </div>
      </div>
    </div>
  );
};
