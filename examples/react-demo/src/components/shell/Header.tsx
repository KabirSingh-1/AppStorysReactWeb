import { useState } from 'react';

import logo from '../../assets/favicon.png';
import './Header.css';

const navGroups = [
  {
    label: 'Features',
    items: ['Stories', 'Reels', 'PiP Videos', 'Bottom Sheets', 'Banners', 'Floaters', 'Widgets'],
  },
  {
    label: 'Advanced Solutions',
    items: ['Quizzes', 'Surveys', 'CSAT Feedback', 'Tooltips', 'Coachmarks', 'Scratch Cards', 'Spotlights'],
  },
  {
    label: 'Resources',
    items: ['Blogs', 'Inspiration Gallery', 'eBook'],
  },
];

export default function Header() {
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="shell-header">
      <div className="shell-header-inner">
        <a href="/" className="shell-brand" onClick={() => setOpen(null)}>
          <img src={logo} alt="AppStorys" />
          <span>AppStorys</span>
        </a>

        <button
          type="button"
          className="shell-menu-toggle"
          onClick={() => setMobileOpen((s) => !s)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <nav className={`shell-nav ${mobileOpen ? 'is-open' : ''}`}>
          {navGroups.map((group) => (
            <div
              className="shell-nav-group"
              key={group.label}
              onMouseEnter={() => setOpen(group.label)}
              onMouseLeave={() => setOpen(null)}
            >
              <button
                type="button"
                className="shell-nav-trigger"
                onClick={() => setOpen((prev) => (prev === group.label ? null : group.label))}
              >
                {group.label} <span>▾</span>
              </button>

              {open === group.label && (
                <div className="shell-nav-dropdown">
                  {group.items.map((item) => (
                    <a key={item} href="#" onClick={(e) => e.preventDefault()}>
                      {item}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}

          <a href="/about" className="shell-nav-link">
            About
          </a>
          <a href="/contact" className="shell-nav-link">
            Contact
          </a>
          <a href="#" onClick={(e) => e.preventDefault()} className="shell-nav-link shell-nav-login">
            Login
          </a>

          <a href="/bookademo" className="shell-header-cta">
            <span className="shell-header-cta-dot" aria-hidden="true">•</span>
            <span>Book a Demo</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
