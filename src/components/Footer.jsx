import React from 'react';
import { CATEGORIES } from '../engine/conversions';
import { Icon } from './Icons';

export function Footer({ onSelectCategory, onOpenLegal, onOpenDevModal, onGoHome }) {
  const handleLegalClick = (e, tab) => {
    if (onOpenLegal) {
      e.preventDefault();
      onOpenLegal(tab);
    }
  };

  const handleHomeClick = (e) => {
    if (onGoHome) {
      e.preventDefault();
      onGoHome(e);
    }
  };

  return (
    <footer className="ct-footer">
      <div className="ct-footer-inner">
        <div className="ct-footer-main">
          <div className="ct-footer-brand-col">
            <a href="/" className="ct-footer-logo" onClick={handleHomeClick} aria-label="ConvertThings Home (Footer)">
              <div className="ct-logo-wrap" aria-hidden="true">
                <Icon name="BrandLogo" size={28} />
              </div>
              <span className="ct-brand-title" aria-label="ConvertThings">
                <span className="ct-brand-name">Convert</span><span className="ct-brand-accent">Things</span>
              </span>
            </a>
            <p className="ct-footer-desc">
              Fast, high-precision unit conversions for engineering, science, culinary arts, and everyday measurement tasks.
            </p>
            <div className="ct-footer-standards">
              <span>NIST &amp; ISO 80000 Precision Verified</span>
            </div>
          </div>

          <div className="ct-footer-links-col">
            <h4 className="ct-footer-heading">Conversion Categories</h4>
            <div className="ct-footer-category-grid">
              {CATEGORIES.map((cat) => (
                <a
                  key={cat.id}
                  href={`/${cat.id}`}
                  className={`ct-footer-cat-link ct-cat-${cat.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectCategory(cat.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <span className="ct-footer-cat-icon" aria-hidden="true">
                    <Icon name={cat.icon} size={15} />
                  </span>
                  <span>{cat.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="ct-footer-bottom">
          <p className="ct-footer-copy">
            &copy; {new Date().getFullYear()} ConvertThings. All rights reserved.
          </p>

          <div className="ct-footer-legal-links">
            <a
              href="/api/mcp"
              className="ct-footer-legal-link"
              onClick={(e) => {
                if (onOpenDevModal) {
                  e.preventDefault();
                  onOpenDevModal();
                }
              }}
            >
              AI &amp; Developer API
            </a>
            <a
              href="/privacy.html"
              className="ct-footer-legal-link"
              onClick={(e) => handleLegalClick(e, 'privacy')}
            >
              Privacy Policy
            </a>
            <a
              href="/terms.html"
              className="ct-footer-legal-link"
              onClick={(e) => handleLegalClick(e, 'terms')}
            >
              Terms of Service
            </a>
            <a
              href="#about"
              className="ct-footer-legal-link"
              onClick={(e) => handleLegalClick(e, 'about')}
            >
              About &amp; Contact
            </a>
            <a
              href="https://github.com/ashtonsprunger/convertthings"
              target="_blank"
              rel="noopener noreferrer"
              className="ct-footer-legal-link"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
