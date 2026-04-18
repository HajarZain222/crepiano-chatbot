import '../styles/components.css'

function Footer() {
  return (
    <footer className="footer">
      {/* 1. Social Icons */}
      <div className="footer-social">
        {/* Facebook */}
        <a
          href="https://www.facebook.com/share/1DrarSuNs1/?mibextid=wwXIfr"
          aria-label="Facebook"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
          </svg>
        </a>
        {/* Instagram */}
        <a
          href="https://www.instagram.com/crepianohurghada5?igsh=MWszdmRmdms1M2x4Ng=="
          aria-label="Instagram"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        </a>
      </div>

      {/* 2. Copyright */}
      <div className="footer-copy">
        <p>&copy; 2026 مطعم كريبيانو. جميع الحقوق محفوظة.</p>
      </div>

      {/* 3. Credits */}
      <div className="footer-dev">
        Developed by {" "}
        <a
          href="https://www.linkedin.com/in/hajarzain222/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Hajar Zain
        </a>
        {" "} & {" "}
        <a
          href="https://www.linkedin.com/in/mohamedamgedd/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Mohamed Amged
        </a>
      </div>
    </footer>
  );
}

export default Footer;
