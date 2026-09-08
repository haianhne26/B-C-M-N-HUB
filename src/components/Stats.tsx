import React from 'react';
import { siteConfig } from '../config/site';

export const Stats: React.FC = () => {
  return (
    <section className="stats-section">
      <div className="container">
        <h3 className="stats-title">{siteConfig.statsTitle}</h3>
        <div className="stats-grid">
          {siteConfig.stats.map((stat, idx) => (
            <div key={idx} className="stat-item">
              <div className="stat-number">{stat.number}</div>
              <h4 className="stat-heading">{stat.title}</h4>
              <p className="stat-desc">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
