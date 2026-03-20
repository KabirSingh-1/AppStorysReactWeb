import { useEffect, useMemo, useState } from 'react';

import sc1 from '../../assets/sc1-1.gif';
import sc2 from '../../assets/sc2.png';
import sc3 from '../../assets/sc3.png';
import sc4 from '../../assets/sc4.png';
import sc5 from '../../assets/sc5.png';
import sc6 from '../../assets/sc6.png';
import sc7 from '../../assets/sc7.png';
import sc8 from '../../assets/sc8.gif';
import sc9 from '../../assets/sc9.png';
import sc10 from '../../assets/sc10.png';
import sc11 from '../../assets/sc11.png';
import sc12 from '../../assets/sc12.png';
import sc13 from '../../assets/sc13.png';
import sc14 from '../../assets/sc14.png';

import './CoreFeatures.css';

type Metric = {
  value: string;
  label: string;
};

type Feature = {
  id: number;
  title: string;
  description: string;
  image: string;
  metrics: Metric[];
};

const features: Feature[] = [
  {
    id: 1,
    title: 'Stories',
    description:
      'Let your brand connect with the audience and elevate your presence through short stories, leavening a lasting impression.',
    image: sc1,
    metrics: [
      { value: '50%', label: 'Increase in Feature Adoption' },
      { value: '37%', label: 'Increase in Page Views' },
      { value: '15%', label: 'Increase in Feature Usage' },
    ],
  },
  {
    id: 2,
    title: 'PiP Videos',
    description:
      'Keep users informed with picture-in-picture videos that deliver updates without disrupting their browsing experience.',
    image: sc2,
    metrics: [
      { value: '60%', label: 'Increase in Feature Adoption' },
      { value: '32%', label: 'Decrease in Time to First Feature Use' },
      { value: '10%', label: 'Increase in 7-Day Retention' },
    ],
  },
  {
    id: 3,
    title: 'Reels',
    description:
      'Let your audience engage and interact with the eye-catching videos that get your message across in seconds.',
    image: sc3,
    metrics: [
      { value: '35%', label: 'Increase in Engagement Rate' },
      { value: '60%', label: 'Increase in Page Views' },
      { value: '45%', label: 'Decrease in Time to First Feature Use' },
    ],
  },
  {
    id: 4,
    title: 'Bottom Sheets',
    description: 'Rich media bite sized content for immersive user experiences.',
    image: sc4,
    metrics: [
      { value: '32%', label: 'Increase in Feature Adoption' },
      { value: '27%', label: 'Decrease in Time to Value' },
      { value: '40%', label: 'Increase in Conversion' },
    ],
  },
  {
    id: 5,
    title: 'Banner',
    description: 'Automatic banner moving with screen for persistent visibility.',
    image: sc5,
    metrics: [
      { value: '50%', label: 'Increase in Feature Adoption' },
      { value: '20%', label: 'Increase in CTR' },
      { value: '40%', label: 'Reduction in Time to Value' },
    ],
  },
  {
    id: 6,
    title: 'Floaters',
    description: 'Small Image/GIF on screen floating with content for subtle engagement.',
    image: sc6,
    metrics: [
      { value: '45%', label: 'Upliftment in Feature Adoption' },
      { value: '25%', label: 'Increase in Feature CTR' },
      { value: '30%', label: 'Reduction in Time to Value' },
    ],
  },
  {
    id: 7,
    title: 'Widgets',
    description: 'Customizable scalable images/animation for enhanced UX.',
    image: sc7,
    metrics: [
      { value: '25%', label: 'Upliftment in Feature Adoption' },
      { value: '30%', label: 'Increase in Conversion' },
      { value: '28%', label: 'Increase in Feature Interaction Rate' },
    ],
  },
  {
    id: 8,
    title: 'Scratch Card',
    description: 'Gamification option to engage users and boost interactions.',
    image: sc8,
    metrics: [
      { value: '65%', label: 'Increase in Engagement Rate' },
      { value: '20%', label: 'Upliftment in D7 Retention' },
      { value: '15%', label: 'Boost in NPS Score' },
    ],
  },
  {
    id: 9,
    title: 'Quiz',
    description: 'Ask users questions and engage them in interactive learning.',
    image: sc9,
    metrics: [
      { value: '40%', label: 'Increase in Engagement' },
      { value: '50%', label: 'Increase in Personalization' },
      { value: '15%', label: 'Increase in Session Length' },
    ],
  },
  {
    id: 10,
    title: 'Survey',
    description: 'Get user inputs systematically for improved product development.',
    image: sc10,
    metrics: [
      { value: '5x', label: 'More Survey Response' },
      { value: '20%', label: 'Upliftment in Engagement' },
      { value: '33%', label: 'More Actionable Insights' },
    ],
  },
  {
    id: 11,
    title: 'CSAT Feedback',
    description: 'Measure services via feedback for continuous improvement.',
    image: sc11,
    metrics: [
      { value: '30%', label: 'Improvement in CSAT Score' },
      { value: '20%', label: 'Increase in NPS Score' },
      { value: '15%', label: 'Reduction in Churn Rate' },
    ],
  },
  {
    id: 12,
    title: 'Tooltips',
    description: 'Onboarding journey for users with helpful contextual information.',
    image: sc12,
    metrics: [
      { value: '55%', label: 'Increase in Activation Rate' },
      { value: '40%', label: 'Increase in Task Completion Rate' },
      { value: '35%', label: 'Reduction in Time to First User Value' },
    ],
  },
  {
    id: 13,
    title: 'Coachmarks',
    description: 'Highlight new features with wrapper for better discoverability.',
    image: sc13,
    metrics: [
      { value: '45%', label: 'Increase in Feature Adoption Rate' },
      { value: '40%', label: 'Reduction in Time to First User Value' },
      { value: '75%', label: 'Increase in Onboarding Task Completion' },
    ],
  },
  {
    id: 14,
    title: 'Spotlight',
    description: 'Get user attention to specific features for enhanced focus.',
    image: sc14,
    metrics: [
      { value: '60%', label: 'Increase in Feature Adoption' },
      { value: '20%', label: 'Upliftment in Conversion Rate' },
      { value: '35%', label: 'Reduction in Time to First User Value' },
    ],
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  const isTarget = feature.id === 1; // target the first feature for tooltips

  return (
    <div className="core-feature-card" id={isTarget ? "information-card" : undefined}>
      <div className="core-feature-image-wrap">
        <div className="core-feature-number">{feature.id}</div>
        <div className="core-feature-image-box">
          <img src={feature.image} alt={`${feature.title} feature`} className="core-feature-image" />
        </div>
      </div>

      <h3 className="core-feature-title" id={isTarget ? "card-title" : undefined}>{feature.title}</h3>
      <p className="core-feature-description" id={isTarget ? "card-description" : undefined}>{feature.description}</p>

      <div className="core-feature-metrics">
        {feature.metrics.map((metric) => (
          <div key={`${feature.id}-${metric.label}`}>
            <p className="core-feature-metric-value">{metric.value}</p>
            <p className="core-feature-metric-label">{metric.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


export default function CoreFeatures() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSlidesToShow(1);
      } else if (window.innerWidth < 1024) {
        setSlidesToShow(2);
      } else {
        setSlidesToShow(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + slidesToShow >= features.length ? 0 : prev + slidesToShow));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev - slidesToShow < 0 ? Math.max(0, features.length - slidesToShow) : prev - slidesToShow
    );
  };

  const visibleFeatures = useMemo(
    () => features.slice(currentIndex, currentIndex + slidesToShow),
    [currentIndex, slidesToShow]
  );

  return (
    <section className="core-features">
      <div className="core-features-inner">
        <p className="core-features-kicker">Core Features</p>
        <h2 className="core-features-title">Incredible User Experiences</h2>

        <div className="core-features-carousel">
          <div className="core-features-grid">
            {visibleFeatures.map((feature) => (
              <div key={feature.id} className="core-feature-column">
                <div className="feature-card-container" data-animated="true">
                  <FeatureCard feature={feature} />
                </div>
              </div>
            ))}
          </div>

          <button onClick={prevSlide} className="core-features-nav core-features-prev" aria-label="Previous slide">
            ‹
          </button>
          <button onClick={nextSlide} className="core-features-nav core-features-next" aria-label="Next slide">
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
