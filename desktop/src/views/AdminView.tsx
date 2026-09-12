import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Shield, Users, Key, DownloadCloud, FileText, Plus, RefreshCw, Lock, Unlock, AlertCircle, Copy } from 'lucide-react';

interface AdminViewProps {
  subView?: string;
}

export const AdminView: React.FC<AdminViewProps> = ({ subView = 'overview' }) => {
  const [activeTab, setActiveTab] = useState(subView);
  const [overview, setOverview] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [keys, setKeys] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bots, setBots] = useState<any[]>([]);
  const [passviews, setPassviews] = useState<any[]>([]);
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

  // Course Management State
  const [courseTitle, setCourseTitle] = useState('');
  const [courseSlug, setCourseSlug] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseCat, setCourseCat] = useState('Trading');
  const [courseThumb, setCourseThumb] = useState('');
  const [coursePremium, setCoursePremium] = useState(false);

  // Add Lesson State
  const [lessonCourseId, setLessonCourseId] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonPreview, setLessonPreview] = useState(false);
  const [allCourses, setAllCourses] = useState<any[]>([]);

  // Bot & Passview State
  const [botTitle, setBotTitle] = useState('');
  const [botDesc, setBotDesc] = useState('');
  const [botUrl, setBotUrl] = useState('');
  const [botVersion, setBotVersion] = useState('');
  const [botPremium, setBotPremium] = useState(false);

  const [pvTitle, setPvTitle] = useState('');
  const [pvBroker, setPvBroker] = useState('');
  const [pvServer, setPvServer] = useState('');
  const [pvAccount, setPvAccount] = useState('');
  const [pvPassword, setPvPassword] = useState('');
  const [pvDesc, setPvDesc] = useState('');
  const [pvPremium, setPvPremium] = useState(false);

  useEffect(() => {
    setActiveTab(subView);
  }, [subView]);

  useEffect(() => {
    loadTabData();
  }, [activeTab, roleFilter]);

  const loadTabData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await api.getAdminOverview();
        setOverview(res.data);
      } else if (activeTab === 'users') {
        const roleQuery = roleFilter === 'ALL' ? '' : roleFilter;
        const res = await api.getUsers(1, 50, '', roleQuery);
        setUsers(res.data || []);
      } else if (activeTab === 'keys') {
        const res = await api.listKeys();
        setKeys(res.data || []);
      } else if (activeTab === 'courses') {
        const res = await api.getCourses();
        setAllCourses(res.data || []);
      } else if (activeTab === 'logs') {
        const res = await api.getAuditLogs();
        setLogs(res.data || []);
      } else if (activeTab === 'support') {
        const resTickets = await api.getAllTickets();
        const resBookings = await api.getAllBookings();
        setTickets(resTickets.data || []);
        setBookings(resBookings.data || []);
      } else if (activeTab === 'resources') {
        const resBots = await api.getBotResources();
        const resPv = await api.getPassviewAccounts();
        setBots(resBots.data || []);
        setPassviews(resPv.data || []);
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

  const handleUpdateRole = async (id: string, newRole: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn chuyển quyền người dùng này thành ${newRole}?`)) return;
    try {
      await api.updateUserRole(id, newRole);
      alert(`Đã cấp quyền ${newRole} thành công!`);
      loadTabData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAssignKey = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn tự động tạo và gán 1 License KEY (Hạn 1 năm) cho người dùng này không?')) return;
    try {
      await api.assignKeyToUser(id);
      alert('Đã sinh và gán KEY thành công!');
      loadTabData();
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

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCourse({
        title: courseTitle,
        slug: courseSlug,
        description: courseDesc,
        category: courseCat,
        thumbnailUrl: courseThumb,
        isPremium: coursePremium
      });
      alert(`Đã tải lên khóa học "${courseTitle}" thành công!`);
      setCourseTitle('');
      setCourseSlug('');
      setCourseDesc('');
      setCourseCat('Trading');
      setCourseThumb('');
      setCoursePremium(false);
      loadTabData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonCourseId) return alert('Vui lòng chọn khóa học');
    try {
      await api.addLesson(lessonCourseId, {
        title: lessonTitle,
        videoUrl: lessonVideoUrl,
        isFreePreview: lessonPreview
      });
      alert(`Đã thêm bài học "${lessonTitle}" thành công!`);
      setLessonTitle('');
      setLessonVideoUrl('');
      setLessonPreview(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createBotResource({
        title: botTitle,
        description: botDesc,
        downloadUrl: botUrl,
        version: botVersion,
        isPremium: botPremium
      });
      alert('Đã thêm Bot thành công!');
      setBotTitle(''); setBotDesc(''); setBotUrl(''); setBotVersion(''); setBotPremium(false);
      loadTabData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreatePassview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createPassviewAccount({
        title: pvTitle,
        broker: pvBroker,
        server: pvServer,
        accountNumber: pvAccount,
        password: pvPassword,
        description: pvDesc,
        isPremium: pvPremium
      });
      alert('Đã thêm Passview thành công!');
      setPvTitle(''); setPvBroker(''); setPvServer(''); setPvAccount(''); setPvPassword(''); setPvDesc(''); setPvPremium(false);
      loadTabData();
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
            className={`btn-desk ${activeTab === 'courses' ? 'btn-desk-primary' : 'btn-desk-secondary'}`}
            onClick={() => setActiveTab('courses')}
          >
            Khóa Học
          </button>
          <button
            className={`btn-desk ${activeTab === 'logs' ? 'btn-desk-primary' : 'btn-desk-secondary'}`}
            onClick={() => setActiveTab('logs')}
          >
            Audit Logs
          </button>
          <button
            className={`btn-desk ${activeTab === 'support' ? 'btn-desk-primary' : 'btn-desk-secondary'}`}
            onClick={() => setActiveTab('support')}
          >
            Hỗ trợ & Booking
          </button>
          <button
            className={`btn-desk ${activeTab === 'resources' ? 'btn-desk-primary' : 'btn-desk-secondary'}`}
            onClick={() => setActiveTab('resources')}
          >
            Tài nguyên (Bot/PV)
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <select 
              className="form-input" 
              style={{ width: '200px' }}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="USER">Chỉ hiện USER</option>
              <option value="IB">Chỉ hiện IB</option>
              <option value="OWNER">Chỉ hiện OWNER</option>
            </select>
          </div>
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
                    {u.role === 'OWNER' ? (
                      <span className="role-badge OWNER">OWNER</span>
                    ) : (
                      <select 
                        className="form-input"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', height: 'auto', backgroundColor: '#1E1B2E', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                      >
                        <option value="USER">USER</option>
                        <option value="IB">IB</option>
                        <option value="OWNER">OWNER</option>
                      </select>
                    )}
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
                    {u.activeLicenseKey ? (
                      u.activeLicenseKey
                    ) : (
                      <button 
                        className="btn-desk btn-desk-primary btn-desk-sm" 
                        onClick={() => handleAssignKey(u.id)}
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      >
                        <Plus size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        Cấp KEY nhanh
                      </button>
                    )}
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
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#C4B5FD', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {k.keyCode}
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(k.keyCode);
                          alert('Đã copy mã KEY: ' + k.keyCode);
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                        title="Copy Key"
                      >
                        <Copy size={14} />
                      </button>
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

      {/* Tab: Courses */}
      {activeTab === 'courses' && (
        <div className="app-card" style={{ maxWidth: 700 }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>Tải Lên Khóa Học Mới</h3>
          <form onSubmit={handleCreateCourse}>
            <div className="form-group">
              <label className="form-label">Tiêu đề khóa học</label>
              <input type="text" className="form-input" value={courseTitle} onChange={e => {
                setCourseTitle(e.target.value);
                if (!courseSlug || courseSlug.length < 3) {
                  setCourseSlug(e.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").replace(/ /g, '-').replace(/[^a-z0-9-]/g, ''));
                }
              }} required />
            </div>
            <div className="form-group">
              <label className="form-label">Đường dẫn (Slug)</label>
              <input type="text" className="form-input" value={courseSlug} onChange={e => {
                const val = e.target.value;
                setCourseSlug(val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").replace(/ /g, '-').replace(/[^a-z0-9-]/g, ''));
              }} required />
            </div>
            <div className="form-group">
              <label className="form-label">Mô tả ngắn</label>
              <textarea className="form-input" rows={3} value={courseDesc} onChange={e => setCourseDesc(e.target.value)} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Danh mục</label>
                <input type="text" className="form-input" value={courseCat} onChange={e => setCourseCat(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Ảnh bìa (URL)</label>
                <input type="text" className="form-input" value={courseThumb} onChange={e => setCourseThumb(e.target.value)} />
              </div>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="coursePremium" checked={coursePremium} onChange={e => setCoursePremium(e.target.checked)} />
              <label htmlFor="coursePremium" style={{ fontSize: '0.875rem', cursor: 'pointer', color: '#F59E0B', fontWeight: 600 }}>Khóa học Premium (Yêu cầu có License KEY)</label>
            </div>
            <button type="submit" className="btn-desk btn-desk-primary">
              <Plus size={16} /> Tải Lên Khóa Học
            </button>
          </form>
        </div>
      )}

      {/* Tab: Add Lesson */}
      {activeTab === 'courses' && (
        <div className="app-card" style={{ maxWidth: 700, marginTop: '20px' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>Thêm Video Bài Học (YouTube)</h3>
          <form onSubmit={handleAddLesson}>
            <div className="form-group">
              <label className="form-label">Chọn Khóa Học</label>
              <select 
                className="form-input" 
                value={lessonCourseId} 
                onChange={e => setLessonCourseId(e.target.value)}
                required
                style={{ background: '#1B1A30', color: '#fff', border: '1px solid var(--border-subtle)' }}
              >
                <option value="" disabled>-- Chọn khóa học --</option>
                {allCourses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tên bài học</label>
              <input type="text" className="form-input" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Link YouTube (URL)</label>
              <input type="url" className="form-input" placeholder="https://youtu.be/..." value={lessonVideoUrl} onChange={e => setLessonVideoUrl(e.target.value)} required />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="lessonPreview" checked={lessonPreview} onChange={e => setLessonPreview(e.target.checked)} />
              <label htmlFor="lessonPreview" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>Cho phép xem thử miễn phí (Free Preview)</label>
            </div>
            <button type="submit" className="btn-desk btn-desk-primary">
              <Plus size={16} /> Lưu Bài Học
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
      {/* Tab: Support & Bookings */}
      {activeTab === 'support' && (
        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Tickets */}
          <div className="app-card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>Quản lý Ticket Hỗ Trợ</h3>
            <div className="app-table-wrapper">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Người gửi</th>
                    <th>Tiêu đề / Loại</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(t => (
                    <tr key={t.id}>
                      <td>{new Date(t.createdAt).toLocaleString('vi-VN')}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{t.user?.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.user?.email}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{t.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#A78BFA' }}>{t.category}</div>
                      </td>
                      <td>
                        <span style={{
                          padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                          background: t.status === 'OPEN' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: t.status === 'OPEN' ? '#F59E0B' : '#10B981'
                        }}>{t.status}</span>
                      </td>
                      <td>
                        <button
                          className="btn-desk btn-desk-secondary btn-desk-sm"
                          onClick={() => {
                            const reply = prompt('Nhập nội dung phản hồi cho user (Sẽ chuyển trạng thái sang RESOLVED):', t.adminReply || '');
                            if (reply !== null) {
                              api.replyTicket(t.id, reply, 'RESOLVED').then(() => {
                                alert('Đã phản hồi thành công');
                                loadTabData();
                              });
                            }
                          }}
                        >
                          Phản hồi
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bookings */}
          <div className="app-card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>Quản lý Booking Zoom</h3>
            <div className="app-table-wrapper">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Lịch hẹn</th>
                    <th>Người gửi</th>
                    <th>Chủ đề</th>
                    <th>Trạng thái</th>
                    <th>Link Zoom</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 600 }}>{new Date(b.bookingDate).toLocaleString('vi-VN')}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.user?.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.user?.email}</div>
                      </td>
                      <td>{b.topic}</td>
                      <td>
                        <select
                          className="form-input"
                          style={{ padding: '4px 8px', fontSize: '0.75rem', height: 'auto', backgroundColor: '#1E1B2E', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                          value={b.status}
                          onChange={(e) => {
                            api.updateBookingStatus(b.id, e.target.value, b.zoomLink).then(() => loadTabData());
                          }}
                        >
                          <option value="PENDING">Chờ xác nhận</option>
                          <option value="CONFIRMED">Đã xác nhận</option>
                          <option value="COMPLETED">Hoàn thành</option>
                          <option value="CANCELLED">Đã hủy</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Link Zoom"
                          style={{ padding: '4px 8px', fontSize: '0.75rem', height: 'auto' }}
                          defaultValue={b.zoomLink || ''}
                          onBlur={(e) => {
                            if (e.target.value !== (b.zoomLink || '')) {
                              api.updateBookingStatus(b.id, b.status, e.target.value).then(() => loadTabData());
                            }
                          }}
                        />
                      </td>
                      <td>
                        <button
                          className="btn-desk btn-desk-secondary btn-desk-sm"
                          onClick={() => {
                            alert('Ghi chú của KH: ' + (b.notes || 'Không có'));
                          }}
                        >
                          Xem Ghi Chú
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Resources (Bot & Passview) */}
      {activeTab === 'resources' && (
        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Create Bot */}
          <div className="app-card" style={{ maxWidth: 700 }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>Thêm Bot mới</h3>
            <form onSubmit={handleCreateBot}>
              <div className="form-group">
                <label className="form-label">Tên Bot</label>
                <input type="text" className="form-input" value={botTitle} onChange={e => setBotTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Mô tả</label>
                <textarea className="form-input" rows={2} value={botDesc} onChange={e => setBotDesc(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Link tải (.ex5 / .ex4 / zip)</label>
                <input type="url" className="form-input" value={botUrl} onChange={e => setBotUrl(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Version</label>
                  <input type="text" className="form-input" value={botVersion} onChange={e => setBotVersion(e.target.value)} placeholder="1.0.0" />
                </div>
                <div className="form-group" style={{ flex: 1, display: 'flex', alignItems: 'flex-end', paddingBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" id="botPremium" checked={botPremium} onChange={e => setBotPremium(e.target.checked)} />
                    <label htmlFor="botPremium" style={{ color: '#F59E0B', fontWeight: 600 }}>Bot Premium (Cần KEY)</label>
                  </div>
                </div>
              </div>
              <button type="submit" className="btn-desk btn-desk-primary"><Plus size={16} /> Lưu Bot</button>
            </form>
          </div>
          
          {/* Bot List */}
          <div className="app-card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>Danh sách Bot</h3>
            <div className="app-table-wrapper">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Tên Bot</th>
                    <th>Version</th>
                    <th>Link tải</th>
                    <th>Premium</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {bots.map(b => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 600 }}>{b.title}</td>
                      <td>{b.version}</td>
                      <td><a href={b.downloadUrl} target="_blank" rel="noreferrer" style={{ color: '#60A5FA' }}>Link tải</a></td>
                      <td>{b.isPremium ? <span style={{ color: '#F59E0B' }}>Có</span> : 'Không'}</td>
                      <td>
                        <button className="btn-desk btn-desk-secondary btn-desk-sm" onClick={() => {
                          if (confirm('Xóa Bot này?')) api.deleteBotResource(b.id).then(() => loadTabData());
                        }}>Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create Passview */}
          <div className="app-card" style={{ maxWidth: 700 }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>Thêm Passview mới</h3>
            <form onSubmit={handleCreatePassview}>
              <div className="form-group">
                <label className="form-label">Tên / Biệt danh tài khoản</label>
                <input type="text" className="form-input" value={pvTitle} onChange={e => setPvTitle(e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Sàn (Broker)</label>
                  <input type="text" className="form-input" value={pvBroker} onChange={e => setPvBroker(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Máy chủ (Server)</label>
                  <input type="text" className="form-input" value={pvServer} onChange={e => setPvServer(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Số tài khoản (ID)</label>
                  <input type="text" className="form-input" value={pvAccount} onChange={e => setPvAccount(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Mật khẩu (Password)</label>
                  <input type="text" className="form-input" value={pvPassword} onChange={e => setPvPassword(e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Mô tả chiến lược đánh</label>
                <textarea className="form-input" rows={2} value={pvDesc} onChange={e => setPvDesc(e.target.value)} />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="pvPremium" checked={pvPremium} onChange={e => setPvPremium(e.target.checked)} />
                <label htmlFor="pvPremium" style={{ color: '#F59E0B', fontWeight: 600 }}>Passview Premium (Cần KEY)</label>
              </div>
              <button type="submit" className="btn-desk btn-desk-primary"><Plus size={16} /> Lưu Passview</button>
            </form>
          </div>

          {/* Passview List */}
          <div className="app-card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '16px' }}>Danh sách Passview</h3>
            <div className="app-table-wrapper">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Sàn / Server</th>
                    <th>ID / Pass</th>
                    <th>Premium</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {passviews.map(pv => (
                    <tr key={pv.id}>
                      <td style={{ fontWeight: 600 }}>{pv.title}</td>
                      <td>
                        <div>{pv.broker}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pv.server}</div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        <div>{pv.accountNumber}</div>
                        <div style={{ fontSize: '0.75rem', color: '#60A5FA' }}>{pv.password}</div>
                      </td>
                      <td>{pv.isPremium ? <span style={{ color: '#F59E0B' }}>Có</span> : 'Không'}</td>
                      <td>
                        <button className="btn-desk btn-desk-secondary btn-desk-sm" onClick={() => {
                          if (confirm('Xóa Passview này?')) api.deletePassviewAccount(pv.id).then(() => loadTabData());
                        }}>Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
