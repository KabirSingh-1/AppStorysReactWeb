import dollarIcon from '../../assets/doller_icon.png';

import './TopBanner.css';

export default function TopBanner() {
  return (
    <div className="top-banner">
      <a
        href="https://www.prweb.com/releases/appstorys-raises-5-million-in-funding-to-accelerate-global-expansion-and-empower-businesses-with-growth-tools-302379955.html"
        target="_blank"
        rel="noreferrer"
        className="top-banner-link"
      >
        <img src={dollarIcon} alt="funding" className="top-banner-icon" />
        <p>We’ve raised $5M to power the next journey of growth</p>
        <span className="top-banner-arrow" aria-hidden="true">
          ↗
        </span>
      </a>
    </div>
  );
}
