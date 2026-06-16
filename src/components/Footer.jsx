import React from "react";
import Link from "next/link";
const Footer = () => {
  return (
    <>
      <style>{`
        .footer-root {
          background: #0c0a14;
          color: #94a3b8;
          position: relative;
          overflow: hidden;
        }

        /* subtle top glow */
        .footer-root::before {
          content: '';
          position: absolute;
          top: 0; left: 50%; transform: translateX(-50%);
          width: 60%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,.55), transparent);
        }

        /* faint radial bloom */
        .footer-root::after {
          content: '';
          position: absolute;
          top: -80px; left: 50%; transform: translateX(-50%);
          width: 600px; height: 300px;
          background: radial-gradient(ellipse, rgba(139,92,246,.07) 0%, transparent 70%);
          pointer-events: none;
        }

        .footer-inner {
          position: relative; z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          padding: 4rem 1.5rem 2rem;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 2.5rem;
        }
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr; }
          .footer-brand { grid-column: 1 / -1; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr; }
        }

        .footer-brand-name {
          font-size: 1.6rem;
          font-weight: 200;
          letter-spacing: -.01em;
          background: linear-gradient(135deg, #a78bfa, #c084fc, #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.1;
          margin-bottom: 2px;
        }
        .footer-brand-sub {
          font-size: .7rem;
          color: #475569;
          letter-spacing: .06em;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }
        .footer-brand-sub strong { color: #64748b; font-weight: 700; }

        .footer-tagline {
          font-size: .85rem;
          line-height: 1.65;
          color: #475569;
          max-width: 240px;
        }

        .footer-col-title {
          font-size: .7rem;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: #e2e8f0;
          margin-bottom: 1.1rem;
        }

        .footer-link {
          display: block;
          font-size: .84rem;
          color: #475569;
          text-decoration: none;
          padding: 4px 0;
          transition: color .18s, transform .18s;
          position: relative;
        }
        .footer-link::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 0; height: 1px;
          background: linear-gradient(90deg, #a78bfa, #f472b6);
          transition: width .22s;
        }
        .footer-link:hover { color: #c4b5fd; transform: translateX(3px); }
        .footer-link:hover::after { width: 60%; }

        .footer-divider {
          border: none;
          border-top: 1px solid rgba(255,255,255,.05);
          margin: 3rem 0 1.5rem;
        }

        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .footer-copy {
          font-size: .78rem;
          color: #334155;
        }

        .footer-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 999px;
          background: rgba(139,92,246,.1);
          border: 1px solid rgba(139,92,246,.2);
          font-size: .7rem;
          font-weight: 600;
          color: #a78bfa;
          letter-spacing: .05em;
        }
        .footer-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #a78bfa;
          animation: footerPulse 2s ease-in-out infinite;
        }
        @keyframes footerPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: .3; }
        }
      `}</style>

      <footer className="footer-root">
        <div className="footer-inner">
          <div className="footer-grid">
            {/* Brand */}
            <div className="footer-brand">
              <div className="footer-brand-name">ResumeOnFly</div>
              <div className="footer-brand-sub">
                prod by <strong>CVtoSalary</strong>
              </div>
              <p className="footer-tagline">
                AI-powered resume tailoring — built for busy job seekers who
                want results, not busywork.
              </p>
            </div>

            {/* Product */}
            <div>
              <p className="footer-col-title">Product</p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <li>
                  <Link href="/contact" className="footer-link">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="footer-link">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="footer-col-title">Company</p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <li>
                  <Link href="/about" className="footer-link">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="footer-link">
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="footer-col-title">Legal</p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <li>
                  <Link href="/privacypolicy" className="footer-link">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/termsandconditions" className="footer-link">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/refundandcancellation" className="footer-link">
                    Refund & Cancellation
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <hr className="footer-divider" />

          <div className="footer-bottom">
            <p className="footer-copy">
              © {new Date().getFullYear()} ResumeOnFly. All rights reserved.
            </p>
            <div className="footer-badge">
              <span className="footer-badge-dot" />
              ResumeOnFly
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
