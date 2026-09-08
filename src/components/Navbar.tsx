import React, { useState } from 'react';
import { siteConfig } from '../config/site';
import { Menu, X, Download, Zap } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container navbar-container">
        {/* Logo */}
        <a href="#hero" className="navbar-logo">
          <div className="navbar-logo-icon">
            <Zap size={18} />
          </div>
          <span>{siteConfig.siteName}</span>
        </a>

        {/* Desktop Nav Items */}
        <nav>
          <ul className="navbar-nav">
            <li><a href="#hero" className="navbar-link">Trang chủ</a></li>
            <li><a href="#features" className="navbar-link">Tính năng</a></li>
            <li><a href="#showcase" className="navbar-link">Giao diện</a></li>
            <li><a href="#download" className="navbar-link">Tải xuống</a></li>
            <li><a href="#faq" className="navbar-link">FAQ</a></li>
          </ul>
        </nav>

        {/* Desktop CTA */}
        <div className="navbar-cta">
          <a href="#download" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.875rem' }}>
            <Download size={16} />
            Tải phần mềm
          </a>
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-mobile-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-overlay">
          <a href="#hero" onClick={closeMobileMenu}>Trang chủ</a>
          <a href="#features" onClick={closeMobileMenu}>Tính năng</a>
          <a href="#showcase" onClick={closeMobileMenu}>Giao diện phần mềm</a>
          <a href="#download" onClick={closeMobileMenu}>Tải xuống</a>
          <a href="#faq" onClick={closeMobileMenu}>Câu hỏi thường gặp</a>
          <div style={{ marginTop: '20px' }}>
            <a href="#download" onClick={closeMobileMenu} className="btn btn-primary" style={{ width: '100%' }}>
              <Download size={18} />
              Tải BẠC MÔN HUB
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
