import React from 'react';
import { siteConfig } from '../config/site';
import { Zap, Send } from 'lucide-react';

export const Footer: React.FC = () => {
  const { socialLinks, footer } = siteConfig;

  // Check if at least one social link is configured
  const hasSocials = socialLinks.telegramUrl || socialLinks.facebookUrl || socialLinks.tiktokUrl;

  return (
    <footer id="contact" className="footer">
      <div className="container">
        <div className="footer-top">
          {/* Brand Info */}
          <div className="footer-brand">
            <div className="navbar-logo" style={{ marginBottom: '8px' }}>
              <div className="navbar-logo-icon" style={{ width: '28px', height: '28px' }}>
                <Zap size={15} />
              </div>
              <span>{siteConfig.siteName}</span>
            </div>
            <p>{footer.tagline}</p>
          </div>

          {/* Navigation Links */}
          <div className="footer-nav">
            <a href="#hero">Trang chủ</a>
            <a href="#features">Tính năng</a>
            <a href="#showcase">Giao diện</a>
            <a href="#download">Tải xuống</a>
            <a href="#faq">Câu hỏi</a>
          </div>

          {/* Social Links (Chỉ hiển thị nếu có link trong config) */}
          {hasSocials && (
            <div className="footer-social">
              {socialLinks.telegramUrl && (
                <a
                  href={socialLinks.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-btn"
                  title="Telegram"
                >
                  <Send size={18} />
                </a>
              )}
              {socialLinks.facebookUrl && (
                <a
                  href={socialLinks.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-btn"
                  title="Facebook"
                >
                  <span style={{ fontWeight: 800, fontSize: '1rem' }}>f</span>
                </a>
              )}
              {socialLinks.tiktokUrl && (
                <a
                  href={socialLinks.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-btn"
                  title="TikTok"
                >
                  <span style={{ fontWeight: 800, fontSize: '0.875rem' }}>TT</span>
                </a>
              )}
            </div>
          )}
        </div>

        <div className="footer-bottom">
          <div>{footer.copyright}</div>
          <div className="footer-disclaimer">{footer.disclaimer}</div>
        </div>
      </div>
    </footer>
  );
};
