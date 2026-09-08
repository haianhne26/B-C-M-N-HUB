import React, { useState } from 'react';
import { siteConfig } from '../config/site';
import { ChevronDown } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="section-wrapper bg-secondary">
      <div className="container">
        <div className="section-header">
          <div className="section-eyebrow">Giải đáp</div>
          <h2>{siteConfig.faqTitle}</h2>
          <p>{siteConfig.faqSubtitle}</p>
        </div>

        <div className="faq-container">
          {siteConfig.faqList.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="faq-item">
                <button
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                >
                  <span>{item.question}</span>
                  <div
                    className="faq-icon-toggle"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <ChevronDown size={20} />
                  </div>
                </button>
                {isOpen && (
                  <div className="faq-answer">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
