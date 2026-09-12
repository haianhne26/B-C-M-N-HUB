import React, { useState, useEffect } from 'react';
import { Cpu, Eye, Copy, DownloadCloud, Server, Users, Key } from 'lucide-react';
import { api } from '../services/api';

export const BotPassviewView: React.FC = () => {
  const [bots, setBots] = useState<any[]>([]);
  const [passviews, setPassviews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'BOT' | 'PASSVIEW'>('BOT');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [resBots, resPass] = await Promise.all([
        api.getBotResources(),
        api.getPassviewAccounts()
      ]);
      setBots(resBots.data || []);
      setPassviews(resPass.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Đã copy!');
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Bot & Passview</h2>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Kho tài nguyên Bot giao dịch và danh sách tài khoản Passview theo dõi
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn-desk ${activeTab === 'BOT' ? 'btn-desk-primary' : 'btn-desk-secondary'}`}
            onClick={() => setActiveTab('BOT')}
          >
            <Cpu size={16} /> Danh sách Bot
          </button>
          <button
            className={`btn-desk ${activeTab === 'PASSVIEW' ? 'btn-desk-primary' : 'btn-desk-secondary'}`}
            onClick={() => setActiveTab('PASSVIEW')}
          >
            <Eye size={16} /> Tài khoản Passview
          </button>
        </div>
      </div>

      {activeTab === 'BOT' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {bots.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Chưa có Bot nào được chia sẻ.
            </div>
          ) : (
            bots.map(bot => (
              <div key={bot.id} className="app-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Cpu size={20} color="white" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{bot.title}</h3>
                      <div style={{ fontSize: '0.75rem', color: '#60A5FA' }}>Version {bot.version || '1.0'}</div>
                    </div>
                  </div>
                  {bot.isPremium && (
                    <span className="crm-badge crm-badge-orange" style={{ padding: '2px 6px', fontSize: '0.6875rem' }}>Premium</span>
                  )}
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                  {bot.description}
                </p>
                <a
                  href={bot.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-desk btn-desk-primary"
                  style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
                >
                  <DownloadCloud size={16} /> Tải Xuống Bot
                </a>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'PASSVIEW' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
          {passviews.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Chưa có tài khoản Passview nào.
            </div>
          ) : (
            passviews.map(pv => (
              <div key={pv.id} className="app-card" style={{ padding: '20px', borderLeft: '4px solid #10B981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{pv.title}</h3>
                  {pv.isPremium && (
                    <span className="crm-badge crm-badge-orange" style={{ padding: '2px 6px', fontSize: '0.6875rem' }}>Premium</span>
                  )}
                </div>

                {pv.description && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5, background: 'var(--bg-input)', padding: '12px', borderRadius: 8 }}>
                    {pv.description}
                  </p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      <Server size={14} /> Sàn giao dịch
                    </div>
                    <div style={{ fontWeight: 600 }}>{pv.broker}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      <Server size={14} /> Server
                    </div>
                    <div style={{ fontWeight: 600 }}>{pv.server}</div>
                  </div>
                  
                  <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      <Users size={14} /> Tài khoản (ID)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{pv.accountNumber}</span>
                      <button onClick={() => handleCopy(pv.accountNumber)} style={{ background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', padding: 2 }}>
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      <Key size={14} /> Mật khẩu Passview
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{pv.password}</span>
                      <button onClick={() => handleCopy(pv.password)} style={{ background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', padding: 2 }}>
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
