import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import hp1 from '../../assets/hp1.png';
import hp2 from '../../assets/hp2.png';
import hp3 from '../../assets/hp3.png';
import hp4 from '../../assets/hp4.png';
import hp5 from '../../assets/hp5.png';

import './HyperPersonalization.css';

const images = [hp1, hp2, hp3, hp4, hp5];

export default function HyperPersonalization() {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setImagesLoaded(true), 1000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!imagesLoaded) return;

    const animationInterval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => window.clearInterval(animationInterval);
  }, [imagesLoaded]);

  return (
    <section className="hyper-personalization">
      <div className="hyper-personalization-inner">
        <div className="hyper-personalization-copy">
          <h2>Hyper Personalization Using Cohorts</h2>
          <p>
            Connect with your CDP to fetch user cohorts (segments) based on their activity,
            behavior, or preferences. You can then show personalized in-app content like stories,
            videos, or banners to each user group helping you boost engagement and conversions
            without any manual work.
          </p>

          {/* Interactive Tag Setup for Tooltip Mapping */}
          <div className="hyper-personalization-tags" id="tags-wrapper">
            <span className="sc-tag red-tag" id="red-tag">
              <span id="red-tag-text">🔴 Critical</span>
            </span>
            <span className="sc-tag teal-tag" id="teal-tag">
              <span id="teal-tag-text">🟢 Active</span>
            </span>
            <span className="sc-tag blue-tag" id="blue-tag">
              <span id="blue-tag-text">🔵 Dynamic</span>
            </span>
          </div>
        </div>

        <div className="hyper-personalization-visual-wrap" data-animated="true">
          <div className="hyper-personalization-visual">
            {!imagesLoaded && <p className="hyper-personalization-loading">Loading animation...</p>}

            {imagesLoaded && (
              <>
                {images.map((image, index) => {
                  const position = (index - activeIndex + images.length) % images.length;
                  const isActive = position === 0;
                  const isEntering = position === images.length - 1;
                  const isExiting = position === 1;

                  let animateProps = {};
                  let initial = {};
                  let transition = {};

                  if (isActive) {
                    animateProps = { opacity: 1, scale: 1, zIndex: 10 };
                    initial = { opacity: 0, scale: 1.05 };
                    transition = {
                      opacity: { duration: 0.8, ease: 'easeInOut' },
                      scale: { duration: 3, ease: 'easeOut' },
                    };
                  } else if (isEntering) {
                    animateProps = { opacity: 0, scale: 1.05, zIndex: 5 };
                    initial = { opacity: 0, scale: 1.05 };
                    transition = {
                      opacity: { duration: 0.5, ease: 'easeIn' },
                      scale: { duration: 0.8, ease: 'easeIn' },
                    };
                  } else if (isExiting) {
                    animateProps = { opacity: 0, scale: 1, zIndex: 8 };
                    initial = { opacity: 1, scale: 1 };
                    transition = {
                      opacity: { duration: 1.2, ease: 'easeOut' },
                      scale: { duration: 0.8, ease: 'easeOut' },
                    };
                  } else {
                    animateProps = { opacity: 0, scale: 1, zIndex: 1 };
                    initial = { opacity: 0, scale: 1 };
                    transition = {
                      opacity: { duration: 0.5 },
                      scale: { duration: 0.5 },
                    };
                  }

                  return (
                    <motion.div
                      key={`hp-${index}`}
                      className="hyper-personalization-frame"
                      initial={initial}
                      animate={animateProps}
                      transition={transition}
                    >
                      <img src={image} alt={`Personalization visualization ${index + 1}`} />
                    </motion.div>
                  );
                })}

                <motion.div
                  className="hyper-personalization-overlay"
                  animate={{ opacity: [0.02, 0.08, 0.02] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
