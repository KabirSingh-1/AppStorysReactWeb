import { useEffect, useState } from 'react';

import star from '../../assets/star.png';
import './Testimonials.css';

type Testimonial = {
  id: number;
  text: string;
  author: string;
  position: string;
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    text: '"AppStorys has revolutionized our user engagement. With the strategic placement of widgets and the floater, we can guide users to key actions seamlessly. Interaction rates have significantly increased, and our app now feels more intuitive and user-friendly than ever."',
    author: '',
    position: 'Product Manager At SciPlay',
  },
  {
    id: 2,
    text: '"AppStorys has made a tremendous difference in how users interact with our app."',
    author: '',
    position: 'VP of Growth at BooHoo',
  },
  {
    id: 3,
    text: '"What stood out most about AppStorys was its effortless integration with our current setup. The in-depth analytics offer clear, actionable insights that continuously help us enhance the user journey."',
    author: '',
    position: 'Head of Growth at Lifeboost Coffee',
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;

    const slideInterval = window.setInterval(() => {
      setCurrentIndex((prev) => (prev < testimonials.length - 1 ? prev + 1 : 0));
    }, 3000);

    return () => window.clearInterval(slideInterval);
  }, [isHovered]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev < testimonials.length - 1 ? prev + 1 : 0));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : testimonials.length - 1));
  };

  return (
    <section className="testimonials">
      <div className="testimonials-inner">
        <div className="testimonials-header">
          <p>Testimonials</p>
          <h2>What Our Clients Have To Say</h2>
        </div>

        <div
          className="testimonials-stage"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => window.setTimeout(() => setIsHovered(false), 1000)}
        >
          {testimonials.map((item, index) => {
            const position =
              index === currentIndex
                ? 'center'
                : index === (currentIndex - 1 + testimonials.length) % testimonials.length
                  ? 'left'
                  : index === (currentIndex + 1) % testimonials.length
                    ? 'right'
                    : 'hidden';

            return (
              <article key={item.id} className={`testimonial-card testimonial-${position}`}>
                {position === 'center' && (
                  <>
                    <img src={star} alt="5 Star Rating" className="testimonial-stars" />
                    <p className="testimonial-text">{item.text}</p>
                    <div>
                      <p className="testimonial-author">{item.author}</p>
                      <p className="testimonial-position">{item.position}</p>
                    </div>
                  </>
                )}
              </article>
            );
          })}

          <div className="testimonial-nav">
            <button type="button" onClick={prevSlide} aria-label="Previous testimonial">
              ‹
            </button>
            <button type="button" onClick={nextSlide} aria-label="Next testimonial">
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
