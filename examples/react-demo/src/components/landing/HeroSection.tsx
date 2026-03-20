import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import * as LottieModule from 'lottie-react';

import animation1 from '../../assets/Herosection-screen-1.json';
import animation2 from '../../assets/Herosection-screen-2.json';
import animation3 from '../../assets/Herosection-screen-3.json';

import './HeroSection.css';

const texts = ['Engagement', 'Retention', 'Stickiness', 'Revenue'];
const textColors = ['#FD5F03', '#03A1FD', '#793BDE', '#F200EA', '#0CB600'];
const Lottie =
  (LottieModule as any).default?.default ??
  (LottieModule as any).default ??
  (LottieModule as any).Lottie ??
  (LottieModule as any);

export default function HeroSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  const longestWord = useMemo(
    () => texts.reduce((a, b) => (a.length > b.length ? a : b)),
    []
  );

  return (
    <section className="landing-hero">
      <div className="landing-hero-inner">
        <h1 className="landing-hero-title">
          <span className="landing-hero-title-static">Increase</span>
          <span className="landing-hero-title-dynamic-wrap">
            <AnimatePresence mode="wait">
              <motion.span
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{ color: textColors[index] }}
                className="landing-hero-title-dynamic"
              >
                {texts[index]}
              </motion.span>
            </AnimatePresence>
            <span className="landing-hero-title-measure">{longestWord}</span>
          </span>
        </h1>

        <p className="landing-hero-subtitle">for your App & website</p>

        <div className="landing-hero-lotties">
          <div className="landing-hero-lottie-item">
            <Lottie animationData={animation1} loop={false} autoplay />
          </div>
          <div className="landing-hero-lottie-item">
            <Lottie animationData={animation2} loop={false} autoplay />
          </div>
          <div className="landing-hero-lottie-item">
            <Lottie animationData={animation3} loop={false} autoplay />
          </div>
        </div>

        <div className="landing-hero-actions">
          <a
            href="https://www.youtube.com/watch?v=IUH_k_5CTFQ"
            target="_blank"
            rel="noreferrer"
            className="landing-hero-watch"
          >
            Watch Demo
          </a>
          <button id="main-text-input" className="landing-hero-cta" type="button">
            Book a Demo
          </button>

        </div>
      </div>
    </section>
  );
}
