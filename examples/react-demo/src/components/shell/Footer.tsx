import footerImg1 from '../../assets/footer_img1.png';
import footerImg2 from '../../assets/footer_img2.png';
import logo from '../../assets/favicon.png';

import './Footer.css';

const columns = [
  {
    title: 'Integratable growth tools',
    links: ['Stories', 'Reels/Short videos', 'PiP Videos', 'Banners', 'Floaters', 'Widgets'],
  },
  {
    title: 'Our SDKs',
    links: ['iOS', 'Android', 'Flutter', 'React Native', 'React.js', 'Angular'],
  },
  {
    title: 'Resources',
    links: ['Blog', 'Inspiration Gallery', 'AppStorys eBook'],
  },
  {
    title: 'Company',
    links: ['About', 'Contact us', 'Careers', 'Security', 'Terms of Service', 'Privacy Policy'],
  },
];

export default function Footer() {
  return (
    <footer className="shell-footer">
      <div className="shell-footer-inner">
        <div className="shell-footer-cta-row">
          <h2>
            Get started today or schedule
            <br />
            a quick 15 min demo
          </h2>
          <a href="/bookademo" className="shell-footer-cta">
            SCHEDULE A DEMO
          </a>
        </div>

        <div className="shell-footer-divider" />

        <div className="shell-footer-brand-row">
          <div className="shell-footer-brand">
            <img src={logo} alt="AppStorys" />
            <span>AppStorys</span>
          </div>
          <div className="shell-footer-socials">
            <a href="https://www.linkedin.com/company/appstorys/" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="https://www.instagram.com/appstorys__/" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://x.com/AppStorys_" target="_blank" rel="noreferrer">X</a>
            <a href="https://www.youtube.com/@appstorys00" target="_blank" rel="noreferrer">YouTube</a>
          </div>
        </div>

        <div className="shell-footer-divider" />

        <div className="shell-footer-columns">
          {columns.map((col) => (
            <div key={col.title} className="shell-footer-column">
              <h3>{col.title}</h3>
              {col.links.map((link) => (
                <a key={link} href="#" onClick={(e) => e.preventDefault()}>
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="shell-footer-bottom">
          <p>2025 AppStorys Inc. All rights reserved</p>
          <p>Made with love in USA & India</p>
          <div className="shell-footer-badges">
            <img src={footerImg1} alt="badge 1" />
            <img src={footerImg2} alt="badge 2" />
          </div>
        </div>
      </div>
    </footer>
  );
}
