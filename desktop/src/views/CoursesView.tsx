import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { GraduationCap, Lock, PlayCircle, BookOpen, Clock, CheckCircle } from 'lucide-react';

export const CoursesView: React.FC<{ onOpenKeyModal: () => void }> = ({ onOpenKeyModal }) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [canAccessPremium, setCanAccessPremium] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await api.getCourses();
      setCourses(res.data || []);
      setCanAccessPremium(res.canAccessPremium);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCourse = async (slug: string) => {
    try {
      const res = await api.getCourseDetail(slug);
      setSelectedCourse(res.data);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Kho Khóa Học & Đào Tạo Trader</h2>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Nâng cao kiến thức và kỷ luật phân tích kỹ thuật từ cơ bản đến nâng cao
          </div>
        </div>

        {canAccessPremium ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', borderRadius: 'var(--radius-full)', fontSize: '0.8125rem', fontWeight: 600 }}>
            <CheckCircle size={15} /> Đã mở khóa nội dung Premium
          </div>
        ) : (
          <button className="btn-desk btn-desk-primary" onClick={onOpenKeyModal} style={{ fontSize: '0.8125rem' }}>
            <Lock size={14} /> Mở khóa Premium (Nhập KEY)
          </button>
        )}
      </div>

      {/* Courses Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {courses.map((course) => (
          <div
            key={course.id}
            className="app-card"
            style={{
              position: 'relative',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onClick={() => handleOpenCourse(course.slug)}
          >
            <div>
              {/* Category & Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#A78BFA' }}>{course.category}</span>
                {course.isPremium ? (
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    background: course.isLocked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(124, 58, 237, 0.2)',
                    color: course.isLocked ? '#FCA5A5' : '#C4B5FD',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    {course.isLocked && <Lock size={11} />}
                    PREMIUM
                  </span>
                ) : (
                  <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: 700, background: 'rgba(16, 185, 129, 0.2)', color: '#6EE7B7' }}>
                    FREE
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '8px' }}>{course.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                {course.description}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <BookOpen size={14} /> {course.chaptersCount || 1} Chương
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#A78BFA', fontWeight: 600 }}>
                <PlayCircle size={14} /> {course.isLocked ? 'Yêu cầu mở khóa' : 'Vào học ngay'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 640 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#A78BFA', fontWeight: 600 }}>{selectedCourse.category}</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 8px 0' }}>{selectedCourse.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{selectedCourse.description}</p>
              </div>
              <button className="btn-desk btn-desk-secondary btn-desk-sm" onClick={() => setSelectedCourse(null)}>Đóng</button>
            </div>

            {selectedCourse.isLocked ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', background: '#1B1A30', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <Lock size={36} color="#EF4444" style={{ margin: '0 auto 10px auto' }} />
                <h4 style={{ fontWeight: 700, marginBottom: '6px' }}>Nội dung này yêu cầu quyền truy cập Premium</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Vui lòng kích hoạt License KEY có dịch vụ Courses hoặc liên hệ IB của bạn để được hỗ trợ mở khóa.
                </p>
                <button className="btn-desk btn-desk-primary" onClick={() => { setSelectedCourse(null); onOpenKeyModal(); }}>
                  Kích hoạt License KEY ngay
                </button>
              </div>
            ) : (
              <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                {selectedCourse.chapters?.map((ch: any) => (
                  <div key={ch.id} style={{ marginBottom: '16px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '8px', color: '#EDE9FE' }}>
                      {ch.title}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {ch.lessons?.map((les: any) => (
                        <div
                          key={les.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 14px',
                            background: '#121124',
                            borderRadius: '8px',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem' }}>
                            <PlayCircle size={16} color="#7C3AED" />
                            <span>{les.title}</span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{les.duration || '15:00'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
