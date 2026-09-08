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

  const [showRules, setShowRules] = useState(false);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>BẠC MÔN AI — Gambler Hub AI System</h2>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: 'rgba(124, 58, 237, 0.2)', color: '#C4B5FD', border: '1px solid rgba(124, 58, 237, 0.4)' }}>
              5-PHASE STRICT RULES
            </span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Hệ thống phân tích chuẩn hóa: Weekly Profile • H1/H4 Market Bias • Session Liquidity • M30 BOS & M15 MSS • Discount/Premium Entry
          </div>
        </div>
        <button
          className="btn-desk btn-desk-secondary"
          style={{ fontSize: '0.8125rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={() => setShowRules(!showRules)}
        >
          <ShieldAlert size={15} color="#A78BFA" />
          {showRules ? 'Đóng luật AI' : 'Xem Luật AI Bạc Môn'}
        </button>
      </div>

      {/* Collapsible Gambler Hub AI System Rules */}
      {showRules && (
        <div className="app-card" style={{ marginBottom: '20px', background: '#0D0B18', border: '1px solid rgba(124, 58, 237, 0.4)', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#A78BFA', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} /> QUY TẮC BẮT BUỘC: GAMBLER HUB AI SYSTEM
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 700 }}>KHÔNG SUY ĐOÁN • THIẾU ĐIỀU KIỆN = CẢNH BÁO RỦI RO</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', fontSize: '0.8125rem' }}>
            <div style={{ background: '#161426', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #7C3AED' }}>
              <div style={{ fontWeight: 800, color: '#C4B5FD', marginBottom: '4px' }}>PHASE 1 - DAILY BIAS FILTER</div>
              <div style={{ color: '#9CA3AF', lineHeight: 1.5 }}>
                • Weekly Profile chỉ lọc xác suất (Classic Expansion, Midweek Reversal, TGIF).<br/>
                • Không dùng vào lệnh, không ghi đè H4/H1.<br/>
                • Cùng hướng H1: Confidence +1. Ngược hướng: Bỏ qua.
              </div>
            </div>

            <div style={{ background: '#161426', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #3B82F6' }}>
              <div style={{ fontWeight: 800, color: '#93C5FD', marginBottom: '4px' }}>PHASE 2 - MARKET BIAS</div>
              <div style={{ color: '#9CA3AF', lineHeight: 1.5 }}>
                • Khung H4, H1. PD Array: OB, Breaker, FVG, IFVG.<br/>
                • <strong>Bias chính luôn lấy theo H1</strong>.<br/>
                • H1 hợp lưu H4: Confidence +2. Chỉ có H1: Confidence +1.
              </div>
            </div>

            <div style={{ background: '#161426', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #F59E0B' }}>
              <div style={{ fontWeight: 800, color: '#FCD34D', marginBottom: '4px' }}>PHASE 3 - SESSION LIQUIDITY</div>
              <div style={{ color: '#9CA3AF', lineHeight: 1.5 }}>
                • <strong>CHỈ GIAO DỊCH PHIÊN NEW YORK</strong>.<br/>
                • Đánh dấu: Asian High/Low, London High/Low, PDH/PDL.<br/>
                • Chưa có Liquidity Sweep ➔ <strong>CẢNH BÁO RỦI RO</strong>.
              </div>
            </div>

            <div style={{ background: '#161426', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #EC4899' }}>
              <div style={{ fontWeight: 800, color: '#F472B6', marginBottom: '4px' }}>PHASE 4 - MARKET STRUCTURE</div>
              <div style={{ color: '#9CA3AF', lineHeight: 1.5 }}>
                • <strong>M30</strong>: Phải có BOS. Nếu không ➔ <strong>NO TRADE</strong>.<br/>
                • <strong>M15</strong>: Phải có Liquidity Sweep + MSS (Thiếu 1 = Cảnh báo).<br/>
                • <em>Exception</em>: M5 có Turtle Soup ➔ Có thể bỏ qua MSS M15.
              </div>
            </div>

            <div style={{ background: '#161426', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #10B981' }}>
              <div style={{ fontWeight: 800, color: '#6EE7B7', marginBottom: '4px' }}>PHASE 5 - ENTRY & TÍN HIỆU</div>
              <div style={{ color: '#9CA3AF', lineHeight: 1.5 }}>
                • Ưu tiên M5 (hoặc M1). Tìm OB, FVG.<br/>
                • <strong>BUY</strong>: Chỉ ở Discount. <strong>SELL</strong>: Chỉ ở Premium.<br/>
                • M5 Turtle Soup: Ưu tiên Entry tại Order Block.<br/>
                • Thiếu bất kỳ điều kiện ➔ <strong>NÓI RÕ RỦI RO</strong>.
              </div>
            </div>
          </div>
        </div>
      )}

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

              {/* Market Structure & Signals */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px', background: '#1E1B4B', color: '#A78BFA', border: '1px solid #4338CA', fontWeight: 600 }}>
                  Cấu trúc: {analysis.marketStructure || 'BOS M30 / MSS M15'}
                </span>
                {analysis.keyLevels?.map((lvl, idx) => (
                  <span key={idx} style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px', background: '#1A1D2D', color: '#93C5FD', border: '1px solid #1E3A8A' }}>
                    {lvl}
                  </span>
                ))}
              </div>

              {/* Reasoning */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#A78BFA', textTransform: 'uppercase', marginBottom: '4px' }}>Phân tích 5 Phase Gambler Hub:</div>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#E5E7EB' }}>{analysis.reasoning}</p>
              </div>

              {/* Invalidation & Risk Warning */}
              <div style={{
                background: analysis.invalidation?.includes('CẢNH BÁO') || analysis.marketBias === 'NEUTRAL'
                  ? 'rgba(239, 68, 68, 0.15)'
                  : 'rgba(239, 68, 68, 0.08)',
                border: analysis.invalidation?.includes('CẢNH BÁO') || analysis.marketBias === 'NEUTRAL'
                  ? '1px solid #EF4444'
                  : '1px solid rgba(239, 68, 68, 0.25)',
                padding: '12px 14px',
                borderRadius: '8px',
                marginBottom: '12px'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#F87171', display: 'flex', alignItems: 'center', gap: 6, marginBottom: '4px', textTransform: 'uppercase' }}>
                  <AlertTriangle size={15} /> CẢNH BÁO RỦI RO & ĐIỀU KIỆN HỦY KÈO (INVALIDATION):
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#FEE2E2', lineHeight: 1.5 }}>
                  {analysis.invalidation}
                </div>
              </div>

              <div style={{ background: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.2)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#C4B5FD', display: 'flex', alignItems: 'center', gap: 6, marginBottom: '2px' }}>
                  <CheckCircle2 size={14} /> Nguyên tắc kỷ luật Bạc Môn:
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#E5E7EB', lineHeight: 1.5 }}>{analysis.educationalExplanation}</div>
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
