import { useRef, type MouseEvent, type ReactNode } from 'react';
import { motion, useSpring } from 'framer-motion';

import securityImg from '../../assets/security_whyus.png';
import audienceImg from '../../assets/audience_whyus.png';
import realtimeImg from '../../assets/realtime_whyus.png';
import quickIntegrationImg from '../../assets/quick_intgration_whyus.png';
import tailoredImg from '../../assets/tailored_whyus.png';
import powerfulImg from '../../assets/powerfull_whyus.png';

import './WhyUs.css';

type WhyUsCardData = {
  title: string;
  image: string;
  description: string;
};

const cards: WhyUsCardData[] = [
  {
    title: 'Security #1 Priority',
    image: securityImg,
    description: 'SOC 2 Type 2 Certified by a leading auditor. AWS infrastructure in place with AES 256 encryption.',
  },
  {
    title: 'Easy Audience segmentation',
    image: audienceImg,
    description: 'Integrate with your CDP, let events flow and show campaigns accordingly.',
  },
  {
    title: 'Real time Analysis',
    image: realtimeImg,
    description: 'Data starts flowing in real time once your campaign goes live. View, analyze and make data drive decisions.',
  },
  {
    title: 'Quick Integration',
    image: quickIntegrationImg,
    description: 'Integrate our SDK (our team can help), test on a sandbox environment and take campaigns live.',
  },
  {
    title: 'Tailored campaigns',
    image: tailoredImg,
    description: 'Show different campaigns to different users based on their attributes and conditions. Powerful segmentation.',
  },
  {
    title: 'Powerful Dashboard',
    image: powerfulImg,
    description: 'Super fast dashboard to create campaigns with deep controls to customize every style, frequency, condition, cohorts and more.',
  },
];

function TiltedCard({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const rotateX = useSpring(0, { damping: 30, stiffness: 100, mass: 2 });
  const rotateY = useSpring(0, { damping: 30, stiffness: 100, mass: 2 });
  const scale = useSpring(1, { damping: 30, stiffness: 100, mass: 2 });

  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;

    rotateX.set((offsetY / (rect.height / 2)) * -12);
    rotateY.set((offsetX / (rect.width / 2)) * 12);
  };

  return (
    <motion.div
      ref={ref}
      className="why-us-tilt"
      onMouseMove={onMouseMove}
      onMouseEnter={() => scale.set(1.05)}
      onMouseLeave={() => {
        scale.set(1);
        rotateX.set(0);
        rotateY.set(0);
      }}
    >
      <motion.div className="why-us-tilt-card" style={{ rotateX, rotateY, scale }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function WhyUs() {
  return (
    <section className="why-us">
      <div className="why-us-inner">
        <p className="why-us-kicker">Why us</p>
        <h2 className="why-us-title">Advanced Features</h2>

        <div className="why-us-grid">
          {cards.map((card, index) => (
            <div key={card.title} className={`why-us-cell ${index > 2 ? 'why-us-cell-offset' : ''}`}>
              <TiltedCard>
                <div className="why-us-card-content">
                  <h3>{card.title}</h3>
                  <div className="why-us-image-wrap">
                    <img src={card.image} alt={card.title} />
                  </div>
                  <p>{card.description}</p>
                </div>
              </TiltedCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
