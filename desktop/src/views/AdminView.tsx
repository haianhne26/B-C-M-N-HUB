import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Shield, Users, Key, DownloadCloud, FileText, Plus, RefreshCw, Lock, Unlock, AlertCircle } from 'lucide-react';

interface AdminViewProps {
  subView?: string;
}

export const AdminView: React.FC<AdminViewProps> = ({ subView = 'overview' }) => {
  const [activeTab, setActiveTab] = useState(subView);
  const [overview, setOverview] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [keys, setKeys] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Key Generation State
  const [keyCount, setKeyCount] = useState(1);
  const [keyDevices, setKeyDevices] = useState(1);
  const [keyDays, setKeyDays] = useState(365);
  const [keyNotes, setKeyNotes] = useState('');

  // App Release State
  const [newVersion, setNewVersion] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [isMandatory, setIsMandatory] = useState(false);

  useEffect(() => {
    setActiveTab(subView);
  }, [subView]);

  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  const loadTabData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await api.getAdminOverview();
        setOverview(res.data);
      } else if (activeTab === 'users') {
        const res = await api.getUsers();
        setUsers(res.data || []);
      } else if (activeTab === 'keys') {
        const res = await api.listKeys();
        setKeys(res.data || []);
      } else if (activeTab === 'logs') {
        const res = await api.getAuditLogs();
        setLogs(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createKeys({
        count: keyCount,
        maxDevices: keyDevices,
        durationDays: keyDays,
        allowedServices: ['trading', 'ai', 'courses', 'calendar'],
        notes: keyNotes,
      });
      alert(`Đã tạo thành công ${keyCount} License KEY mới!`);
      setKeyNotes('');
      loadTabData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleUserStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
    try {
      await api.toggleUserStatus(id, nextStatus as any);
      loadTabData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResetPassword = async (id: string) => {
    const pass = prompt('Nhập mật khẩu mới cho người dùng (tối thiểu 6 ký tự):', 'Bmh@123456');
    if (!pass) return;
    try {
      await api.resetUserPassword(id, pass);
      alert('Đã cập nhật mật khẩu thành công!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePublishUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.publishUpdate({
        version: newVersion,
        downloadUrl,
        releaseNotes,
        isMandatory,
      });
      alert(`Đã phát hành phiên bản v${newVersion} thành công!`);
      setNewVersion('');
      setDownloadUrl('');
      setReleaseNotes('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Trung Tâm Quản Trị Hệ Thống (OWNER)</h2>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Toàn quyền giám sát người dùng, sinh mã bản quyền, quản lý cập nhật và kiểm tra bảo mật
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn-desk ${activeTab === 'overview' ? 'btn-desk-primary' : 'btn-desk-secondary'}`}
            onClick={() => setActiveTab('overview')}
          >
            Tổng quan
          </button>
          <button
            className={`btn-desk ${activeTab === 'users' ? 'btn-desk-primary' : 'btn-desk-secondary'}`}
            onClick={() => setActiveTab('users')}
          >
            Người dùng
          </button>
          <button
            className={`btn-desk ${activeTab === 'keys' ? 'btn-desk-primary' : 'btn-desk-secondary'}`}
            onClick={() => setActiveTab('keys')}
          >
            License KEY
          </button>
          <button
            className={`btn-desk ${activeTab === 'updates' ? 'btn-desk-primary' : 'btn-desk-secondary'}`}
            onClick={() => setActiveTab('updates')}
          >
            Cập nhật App
          </button>
          <button
            className={`btn-desk ${activeTab === 'logs' ? 'btn-desk-primary' : 'btn-desk-secondary'}`}
            onClick={() => setActiveTab('logs')}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && overview && (
        <div>
          <div className="stats-cards-grid">
            <div className="app-card">
              <div className="app-card-title">Tổng số User</div>
              <div className="app-card-value">{overview.stats.totalUsers}</div>
              <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '4px' }}>
                Đang hoạt động: {overview.stats.activeUsers}
              </div>
            </div>

            <div className="app-card">
              <div className="app-card-title">Đối tác IB</div>
              <div className="app-card-value" style={{ color: '#60A5FA' }}>{overview.stats.totalIBs}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Hệ thống đại lý phân phối
              </div>
            </div>

            <div className="app-card">
              <div className="app-card-title">KEY đang hoạt động</div>
              <div className="app-card-value" style={{ color: '#C4B5FD' }}>{overview.stats.activeKeys}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Hết hạn: {overview.stats.expiredKeys}
              </div>
            </div>

            <div className="app-card">
              <div className="app-card-title">Phiên bản Desktop</div>
              <div className="app-card-value" style={{ fontSize: '1.25rem' }}>v{overview.stats.currentAppVersion}</div>
              <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '4px' }}>
                Trạng thái: Hoạt động ổn định
              </div>
            </div>
          </div>

          <div className="app-card">
            <h4 style={{ fontWeight: 700, marginBottom: '14px' }}>Trạng thái hạ tầng hệ thống</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#100F1E', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.6875rem', color: '#9CA3AF' }}>Cơ sở dữ liệu (Database)</div>
                <div style={{ fontWeight: 700, color: '#10B981' }}>{overview.systemStatus.database}</div>
              </div>
              <div style={{ background: '#100F1E', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.6875rem', color: '#9CA3AF' }}>Google Gemini AI API</div>
                <div style={{ fontWeight: 700, color: '#C4B5FD' }}>{overview.systemStatus.geminiApi}</div>
              </div>
              <div style={{ background: '#100F1E', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.6875rem', color: '#9CA3AF' }}>Cầu nối MT5 Bridge</div>
                <div style={{ fontWeight: 700, color: '#60A5FA' }}>{overview.systemStatus.mt5Bridge}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Users */}
      {activeTab === 'users' && (
        <div className="app-table-wrapper">
          <table className="app-table">
            <thead>
              <tr>
                <th>Họ tên & Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>License KEY</th>
                <th>Thiết bị</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{u.fullName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                  </td>
                  <td>
                    <span className={`role-badge ${u.role}`}>{u.role}</span>
                  </td>
                  <td>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: u.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: u.status === 'ACTIVE' ? '#10B981' : '#EF4444'
                    }}>
                      {u.status}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                    {u.activeLicenseKey || '—'}
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {u.devices?.length || 0} máy
                  </td>
                  <td>
                    {u.role !== 'OWNER' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn-desk btn-desk-secondary btn-desk-sm"
                          onClick={() => handleToggleUserStatus(u.id, u.status)}
                        >
                          {u.status === 'ACTIVE' ? <Lock size={12} /> : <Unlock size={12} />}
                          {u.status === 'ACTIVE' ? 'Khóa' : 'Mở'}
                        </button>
                        <button
                          className="btn-desk btn-desk-secondary btn-desk-sm"
                          onClick={() => handleResetPassword(u.id)}
                        >
                          Đổi Pass
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Keys */}
      {activeTab === 'keys' && (
        <div>
          {/* Key Generator Form */}
          <div className="app-card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>Sinh mã License KEY mới</h3>
            <form onSubmit={handleCreateKeys}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Số lượng KEY cần tạo</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    className="form-input"
                    value={keyCount}
                    onChange={(e) => setKeyCount(parseInt(e.target.value, 10))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Giới hạn thiết bị (Max Devices)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="form-input"
                    value={keyDevices}
                    onChange={(e) => setKeyDevices(parseInt(e.target.value, 10))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Thời hạn sử dụng (Số ngày)</label>
                  <input
                    type="number"
                    min={1}
                    className="form-input"
                    value={keyDays}
                    onChange={(e) => setKeyDays(parseInt(e.target.value, 10))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Ghi chú mục đích tạo KEY</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Gói VIP 1 năm cho trader / Tặng đối tác..."
                  value={keyNotes}
                  onChange={(e) => setKeyNotes(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-desk btn-desk-primary">
                <Plus size={16} /> Tạo License KEY
              </button>
            </form>
          </div>

          {/* Keys Table */}
          <div className="app-table-wrapper">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Mã KEY</th>
                  <th>Trạng thái</th>
                  <th>Người dùng kích hoạt</th>
                  <th>Thiết bị</th>
                  <th>Hết hạn</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#C4B5FD' }}>
                      {k.keyCode}
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: k.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.2)' : k.status === 'UNUSED' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: k.status === 'ACTIVE' ? '#10B981' : k.status === 'UNUSED' ? '#60A5FA' : '#EF4444'
                      }}>
                        {k.status}
                      </span>
                    </td>
                    <td>{k.userEmail || '—'}</td>
                    <td>{k.currentDevicesCount} / {k.maxDevices} máy</td>
                    <td>{k.expiresAt ? new Date(k.expiresAt).toLocaleDateString('vi-VN') : 'Vĩnh viễn'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn-desk btn-desk-secondary btn-desk-sm"
                          onClick={() => {
                            if (confirm('Bạn có chắc muốn thu hồi KEY này?')) {
                              api.revokeKey(k.id).then(() => loadTabData());
                            }
                          }}
                        >
                          Thu hồi
                        </button>
                        <button
                          className="btn-desk btn-desk-secondary btn-desk-sm"
                          onClick={() => {
                            api.resetKeyDevices(k.id).then(() => {
                              alert('Đã reset thiết bị đăng ký của KEY!');
                              loadTabData();
                            });
                          }}
                        >
                          Reset máy
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Updates */}
      {activeTab === 'updates' && (
        <div className="app-card" style={{ maxWidth: 640 }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>Phát hành phiên bản cập nhật mới</h3>
          <form onSubmit={handlePublishUpdate}>
            <div className="form-group">
              <label className="form-label">Số phiên bản mới (Ví dụ: 1.0.1)</label>
              <input
                type="text"
                className="form-input"
                placeholder="1.0.1"
                value={newVersion}
                onChange={(e) => setNewVersion(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Link tải file cài đặt (Download URL)</label>
              <input
                type="text"
                className="form-input"
                placeholder="http://localhost:4000/updates/BacMonHub-Setup-1.0.1.exe"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nội dung cập nhật (Release Notes)</label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="- Nâng cấp tốc độ AI phân tích biểu đồ&#10;- Bổ sung tính năng Lịch kinh tế theo phiên&#10;- Sửa lỗi kết nối MT5 Bridge"
                value={releaseNotes}
                onChange={(e) => setReleaseNotes(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="checkbox"
                id="mandatory"
                checked={isMandatory}
                onChange={(e) => setIsMandatory(e.target.checked)}
              />
              <label htmlFor="mandatory" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
                Bắt buộc cập nhật (Người dùng phiên bản cũ không được tiếp tục dùng)
              </label>
            </div>
            <button type="submit" className="btn-desk btn-desk-primary">
              <DownloadCloud size={16} /> Xuất bản bản cập nhật
            </button>
          </form>
        </div>
      )}

      {/* Tab: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="app-table-wrapper">
          <table className="app-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Người thực hiện</th>
                <th>Hành động</th>
                <th>Đối tượng</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    {new Date(log.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{log.userEmail}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{log.userRole}</div>
                  </td>
                  <td>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(124, 58, 237, 0.15)', color: '#C4B5FD', fontSize: '0.75rem', fontWeight: 600 }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8125rem' }}>
                    {log.targetType || '—'} {log.targetId ? `(#${log.targetId.substring(0, 8)}...)` : ''}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
