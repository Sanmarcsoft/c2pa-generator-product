import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        {/* Company & Branding */}
        <div className="footer-section footer-brand">
          <div className="footer-logo">
            <img
              src="/images/logos/trusteddit_logo_00.png"
              alt="Trusteddit Logo"
              className="footer-logo-image"
            />
            <div>
              <h3 className="footer-brand-name">
                <span className="trusteddit-blue">Trustedd</span><span className="trusteddit-orange">it</span>
              </h3>
              <p className="footer-brand-tagline">
                C2PA Certification Platform
              </p>
            </div>
          </div>
          <p className="footer-company-info">
            A product of <strong>SanMarcSoft LLC</strong>
          </p>
          <p className="footer-description">
            Empowering content creators and organizations with trusted,
            verifiable digital provenance through C2PA standards.
          </p>
        </div>

        {/* C2PA Resources */}
        <div className="footer-section">
          <h4 className="footer-section-title">C2PA Resources</h4>
          <ul className="footer-links">
            <li>
              <a
                href="https://spec.c2pa.org/conformance-explorer/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link footer-link-featured"
              >
                <span className="link-icon">🔍</span>
                <div>
                  <strong>Conformance Explorer</strong>
                  <span className="link-description">
                    Test and validate C2PA implementations
                  </span>
                </div>
              </a>
            </li>
            <li>
              <a
                href="https://c2pa.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                C2PA Official Website
              </a>
            </li>
            <li>
              <a
                href="https://spec.c2pa.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                Technical Specifications
              </a>
            </li>
            <li>
              <a
                href="https://opensource.contentauthenticity.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                Open Source Tools
              </a>
            </li>
          </ul>
        </div>

        {/* Membership & Community */}
        <div className="footer-section">
          <h4 className="footer-section-title">Community</h4>
          <div className="membership-badge">
            <div className="badge-icon">✓</div>
            <div className="badge-content">
              <strong>CAI Member</strong>
              <p>Content Authenticity Initiative</p>
            </div>
          </div>
          <p className="membership-description">
            SanMarcSoft LLC is a proud member of the Content Authenticity
            Initiative, working to restore trust in digital content.
          </p>
          <a
            href="https://contentauthenticity.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Learn About CAI →
          </a>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4 className="footer-section-title">Platform</h4>
          <ul className="footer-links">
            <li>
              <a href="/" className="footer-link">
                Home
              </a>
            </li>
            <li>
              <a href="/documents" className="footer-link">
                Documents
              </a>
            </li>
            <li>
              <a href="/progress" className="footer-link">
                Progress Tracker
              </a>
            </li>
            <li>
              <a href="/chat" className="footer-link">
                AI Assistant
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="footer-bottom">
        <p className="footer-copyright">
          © {currentYear} SanMarcSoft LLC. All rights reserved.
        </p>
        <p className="footer-domain">
          <a href="https://trusteddit.com" className="domain-link">
            trusteddit.com
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
