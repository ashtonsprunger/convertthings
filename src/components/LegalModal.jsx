import React, { useState, useEffect } from 'react';

/**
 * LegalModal Component
 * Accessible dialog presenting Privacy Policy (AdSense & GDPR compliant),
 * Terms of Service, and About/Contact information.
 */
export function LegalModal({ isOpen, initialTab = 'privacy', onClose }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent background scrolling while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="ct-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="ct-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ct-legal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ct-modal-header">
          <div className="ct-modal-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'privacy'}
              className={`ct-modal-tab ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              Privacy Policy
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'terms'}
              className={`ct-modal-tab ${activeTab === 'terms' ? 'active' : ''}`}
              onClick={() => setActiveTab('terms')}
            >
              Terms of Service
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'about'}
              className={`ct-modal-tab ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              About & Contact
            </button>
          </div>

          <button
            type="button"
            className="ct-modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        <div className="ct-modal-body">
          {activeTab === 'privacy' && (
            <div className="ct-legal-content">
              <h2 id="ct-legal-title">Privacy Policy</h2>
              <p className="ct-legal-meta">Last updated: October 5, 2026</p>

              <div className="ct-legal-callout">
                <strong>Summary:</strong> ConvertThings values your privacy. We do not require registration, accounts, or collection of personal identification information. Third-party advertising (Google AdSense) uses standard cookies to deliver relevant ads.
              </div>

              <h3>1. Data Collection & Local Storage</h3>
              <p>
                ConvertThings does not collect personal identity information such as names, phone numbers, or passwords. Your conversion preferences, starred favorites, and recent history are saved solely on your local device via browser <code>localStorage</code>.
              </p>

              <h3>2. Third-Party Advertising & Cookies (Google AdSense)</h3>
              <p>
                To maintain ConvertThings as a free service, we display advertising served by Google AdSense:
              </p>
              <ul>
                <li>Third-party vendors, including Google, use cookies to serve ads based on prior visits to this website or other sites on the Internet.</li>
                <li>Google's use of advertising cookies enables it and its partners to serve ads based on visits to ConvertThings and other websites.</li>
                <li>
                  You may opt out of personalized advertising by visiting{' '}
                  <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
                    Google Ads Settings
                  </a>{' '}
                  or via{' '}
                  <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">
                    aboutads.info
                  </a>.
                </li>
              </ul>
              <p>
                Learn more about how Google handles information:{' '}
                <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
                  How Google uses information from sites or apps that use our services
                </a>.
              </p>

              <h3>3. Consent Management (EEA, UK, and Switzerland)</h3>
              <p>
                For visitors residing in the European Economic Area (EEA), the United Kingdom, and Switzerland, we utilize Google's certified Consent Management Platform (CMP) to collect consent for non-essential cookies and personalized advertising in accordance with GDPR.
              </p>

              <h3>4. California Privacy Rights (CCPA / CPRA)</h3>
              <p>
                California residents maintain rights regarding their personal data under the CCPA/CPRA. You may adjust advertising preferences or opt out of personalized tracking via our consent banner or Global Privacy Control (GPC) signals.
              </p>

              <h3>5. Contact</h3>
              <p>
                If you have questions regarding this Privacy Policy, please reach out at{' '}
                <a href="mailto:support@convertthings.com">support@convertthings.com</a>.
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="ct-legal-content">
              <h2 id="ct-legal-title">Terms of Service</h2>
              <p className="ct-legal-meta">Last updated: October 5, 2026</p>

              <h3>1. Acceptance of Terms</h3>
              <p>
                By accessing and using ConvertThings (convertthings.com), you acknowledge and agree to these Terms of Service.
              </p>

              <h3>2. Purpose & Accuracy of Calculations</h3>
              <p>
                ConvertThings is a calculation and unit conversion platform for engineering, science, culinary arts, education, and daily productivity. Conversion factors are calibrated against official National Institute of Standards and Technology (NIST) and ISO 80000 definitions.
              </p>
              <p>
                Conversions are provided "as is" without warranty. While calculations are engineered to high mathematical precision, always verify figures for mission-critical engineering, aviation, healthcare, or life-safety applications.
              </p>

              <h3>3. Intellectual Property</h3>
              <p>
                The design, user interface layout, SVG icons, and proprietary code of ConvertThings are protected by copyright and intellectual property laws.
              </p>

              <h3>4. Contact</h3>
              <p>
                For inquiries regarding these terms, please contact{' '}
                <a href="mailto:support@convertthings.com">support@convertthings.com</a>.
              </p>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="ct-legal-content">
              <h2 id="ct-legal-title">About ConvertThings</h2>
              <p className="ct-legal-meta">High-Precision Universal Unit Conversion</p>

              <p>
                ConvertThings was engineered to deliver instantaneous, zero-latency unit conversions without clutter, aggressive ads, or floating-point rounding errors.
              </p>

              <h3>Key Standards & Calibration</h3>
              <ul>
                <li><strong>NIST Special Publication 811:</strong> Guide for the Use of the International System of Units (SI).</li>
                <li><strong>ISO 80000:</strong> Quantities and units international standard.</li>
                <li><strong>IEEE 754 Arithmetic:</strong> Custom formatting engine that eliminates binary floating-point artifacts.</li>
              </ul>

              <h3>Contact & Suggestions</h3>
              <p>
                Have a suggestion for a new unit or measurement category? Found a bug? We welcome feedback:
              </p>
              <p>
                <strong>Email:</strong>{' '}
                <a href="mailto:support@convertthings.com">support@convertthings.com</a>
              </p>
            </div>
          )}
        </div>

        <div className="ct-modal-footer">
          <button
            type="button"
            className="ct-btn-primary ct-modal-done-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default LegalModal;
