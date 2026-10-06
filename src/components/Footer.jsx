import React from 'react';
import { CATEGORIES } from '../engine/conversions';

export function Footer({ onSelectCategory, onOpenLegal, onOpenDevModal }) {
  const handleLegalClick = (e, tab) => {
    if (onOpenLegal) {
      e.preventDefault();
      onOpenLegal(tab);
    }
  };

  return (
    <footer className="ct-footer">
      <div className="ct-footer-inner">
        <div className="ct-footer-brand-col">
          <div className="ct-footer-logo">
            <span className="ct-brand-title">ConvertThings</span>
          </div>
          <p className="ct-footer-desc">
            Fast, high-precision unit conversions for engineering, science, culinary arts, and everyday measurement tasks.
          </p>
          <div className="ct-footer-standards">
            <span>Calibrated with official NIST & ISO 80000 standards.</span>
          </div>
        </div>

        <div className="ct-footer-links-col">
          <h4 className="ct-footer-heading">Conversion Categories</h4>
          <div className="ct-footer-category-grid">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className="ct-footer-cat-link"
                onClick={() => {
                  onSelectCategory(cat.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="ct-footer-bottom">
        <div className="ct-footer-bottom-inner">
          <p className="ct-footer-copy">
            &copy; {new Date().getFullYear()} ConvertThings. All rights reserved.
          </p>

          <div className="ct-footer-legal-links">
            <a
              href="/api/mcp"
              className="ct-footer-legal-link ct-footer-api-link"
              onClick={(e) => {
                if (onOpenDevModal) {
                  e.preventDefault();
                  onOpenDevModal();
                }
              }}
            >
              ⚡ AI &amp; Developer API
            </a>
            <span className="ct-dot">&bull;</span>
            <a
              href="/privacy.html"
              className="ct-footer-legal-link"
              onClick={(e) => handleLegalClick(e, 'privacy')}
            >
              Privacy Policy
            </a>
            <span className="ct-dot">&bull;</span>
            <a
              href="/terms.html"
              className="ct-footer-legal-link"
              onClick={(e) => handleLegalClick(e, 'terms')}
            >
              Terms of Service
            </a>
            <span className="ct-dot">&bull;</span>
            <a
              href="#about"
              className="ct-footer-legal-link"
              onClick={(e) => handleLegalClick(e, 'about')}
            >
              About &amp; Contact
            </a>
            <span className="ct-dot">&bull;</span>
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
