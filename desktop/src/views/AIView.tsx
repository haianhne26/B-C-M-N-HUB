import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Bot, Upload, Sparkles, Send, ShieldAlert, ArrowUpRight, CheckCircle2, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { AIAnalysisResult } from '../../../shared';

export const AIView: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [userQuestion, setUserQuestion] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatting, setChatting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Paste Image from Clipboard (Ctrl + V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const b64 = e.target?.result as string;
      setImagePreview(b64);
      setImageBase64(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!imageBase64) return;
    setAnalyzing(true);
    try {
      const res = await api.analyzeChart(imageBase64, userQuestion, conversationId || undefined);
      setAnalysis(res.analysis);
      setConversationId(res.conversationId);
      setChatMessages([
        { role: 'USER', content: userQuestion || 'Phân tích biểu đồ kỹ thuật này giúp tôi.' },
        { role: 'ASSISTANT', content: res.analysis.reasoning }
      ]);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi phân tích ảnh');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !conversationId) return;

    const msg = inputMessage.trim();
    setInputMessage('');
    setChatMessages((prev) => [...prev, { role: 'USER', content: msg }]);
    setChatting(true);

    try {
      const res = await api.sendAIChat(conversationId, msg);
      setChatMessages((prev) => [...prev, { role: 'ASSISTANT', content: res.content }]);
    } catch (err: any) {
      setChatMessages((prev) => [...prev, { role: 'ASSISTANT', content: 'Lỗi: ' + (err.message || 'Không thể gửi tin nhắn') }]);
    } finally {
      setChatting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>BẠC MÔN AI — Trợ Lý Phân Tích Chart</h2>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Hỗ trợ nhận diện cấu trúc sóng, vùng thanh khoản FVG, điểm vào lệnh và quản lý rủi ro bằng Google Gemini Vision API
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '24px' }}>
        {/* Left Column: Upload & Analysis Breakdown */}
        <div>
          {/* Uploader Box */}
          <div
            className="app-card"
            style={{
              border: '2px dashed var(--border-subtle)',
              textAlign: 'center',
              padding: '28px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              style={{ display: 'none' }}
            />

            {imagePreview ? (
              <div>
                <img
                  src={imagePreview}
                  alt="Chart Preview"
                  style={{ maxHeight: '240px', maxWidth: '100%', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}
                />
                <div style={{ marginTop: '12px', fontSize: '0.8125rem', color: '#A78BFA' }}>
                  Click hoặc kéo thả để chọn ảnh khác (hoặc dán Ctrl + V)
                </div>
              </div>
            ) : (
              <div>
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(124, 58, 237, 0.15)', color: '#A78BFA', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                  <Upload size={24} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '6px' }}>
                  Tải lên ảnh biểu đồ Trading (Chart)
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Kéo thả file vào đây, click để duyệt file hoặc chỉ cần nhấn <strong>Ctrl + V</strong> để dán ảnh chụp màn hình
                </p>
              </div>
            )}
          </div>

          {imagePreview && (
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Ghi chú thêm câu hỏi (vd: Phân tích khung H1, tìm điểm Sell...)"
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
              />
              <button
                className="btn-desk btn-desk-primary"
                style={{ flexShrink: 0, padding: '0 24px' }}
                onClick={handleAnalyze}
                disabled={analyzing}
              >
                {analyzing ? <Sparkles size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {analyzing ? 'Đang phân tích...' : 'Phân tích ngay'}
              </button>
            </div>
          )}

          {/* Structured Analysis Results */}
          {analysis && (
            <div className="app-card" style={{ border: '1px solid rgba(124, 58, 237, 0.4)', background: '#121124' }}>
              {/* Bias Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Market Bias</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: analysis.marketBias === 'BUY' ? '#10B981' : analysis.marketBias === 'SELL' ? '#EF4444' : '#F59E0B' }}>
                    {analysis.marketBias}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Độ tự tin (Confidence)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#C4B5FD' }}>
                    {analysis.confidence}%
                  </div>
                </div>
              </div>

              {/* Levels Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: '#1B1A30', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.6875rem', color: '#9CA3AF' }}>Vùng vào lệnh (Entry)</div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#FFFFFF' }}>{analysis.entry}</div>
                </div>
                <div style={{ background: '#1B1A30', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.6875rem', color: '#EF4444' }}>Cắt lỗ (Stop Loss)</div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#EF4444' }}>{analysis.stopLoss}</div>
                </div>
                <div style={{ background: '#1B1A30', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.6875rem', color: '#10B981' }}>Chốt lời (Take Profit)</div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#10B981' }}>{analysis.takeProfit}</div>
                </div>
                <div style={{ background: '#1B1A30', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.6875rem', color: '#60A5FA' }}>Tỷ lệ R:R</div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#60A5FA' }}>{analysis.riskReward}</div>
                </div>
              </div>

              {/* Reasoning */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#A78BFA', textTransform: 'uppercase', marginBottom: '4px' }}>Lý do phân tích:</div>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#E5E7EB' }}>{analysis.reasoning}</p>
              </div>

              {/* Invalidation & Educational */}
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FCA5A5', display: 'flex', alignItems: 'center', gap: 6, marginBottom: '2px' }}>
                  <AlertTriangle size={14} /> Điều kiện hủy kịch bản (Invalidation):
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#E5E7EB' }}>{analysis.invalidation}</div>
              </div>

              <div style={{ background: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.2)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#C4B5FD', display: 'flex', alignItems: 'center', gap: 6, marginBottom: '2px' }}>
                  <CheckCircle2 size={14} /> Lời khuyên giáo dục:
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#E5E7EB' }}>{analysis.educationalExplanation}</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Multi-turn Chat Assistant */}
        <div className="app-card" style={{ display: 'flex', flexDirection: 'column', height: '620px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '14px' }}>
            <Bot size={20} color="#7C3AED" />
            <h4 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>Hỏi đáp chuyên sâu với Bạc Môn AI</h4>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '6px' }}>
            {chatMessages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto 0' }}>
                <Bot size={36} style={{ margin: '0 auto 10px auto', opacity: 0.4 }} />
                <p style={{ fontSize: '0.875rem' }}>Sau khi phân tích ảnh chart, bạn có thể hỏi tiếp bất kỳ thắc mắc nào về xu hướng, điểm cắt lỗ, FVG hay cấu trúc thị trường tại đây.</p>
              </div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.role === 'USER' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: msg.role === 'USER' ? 'var(--primary)' : '#1B1A30',
                    color: '#FFFFFF',
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                  }}
                >
                  {msg.content}
                </div>
              ))
            )}
            {chatting && (
              <div style={{ alignSelf: 'flex-start', background: '#1B1A30', padding: '8px 14px', borderRadius: '12px', fontSize: '0.8125rem', color: '#9CA3AF' }}>
                Bạc Môn AI đang suy nghĩ...
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
            <input
              type="text"
              className="form-input"
              placeholder={conversationId ? 'Hỏi thêm (vd: Nếu thủng hỗ trợ thì sao?)...' : 'Vui lòng phân tích ảnh trước'}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={!conversationId || chatting}
            />
            <button
              type="submit"
              className="btn-desk btn-desk-primary"
              disabled={!conversationId || chatting || !inputMessage.trim()}
            >
              <Send size={16} />
            </button>
          </form>

          {/* Safety Disclaimer */}
          <div style={{ marginTop: '10px', fontSize: '0.6875rem', color: 'var(--text-muted)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <ShieldAlert size={12} /> Bạc Môn AI cung cấp góc nhìn tham khảo, không tự động đặt lệnh hay cam kết lợi nhuận.
          </div>
        </div>
      </div>
    </div>
  );
};
