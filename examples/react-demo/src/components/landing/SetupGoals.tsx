import * as LottieModule from 'lottie-react';

import goalsAnimation from '../../assets/goalsfiles.json';
import './SetupGoals.css';

const Lottie =
  (LottieModule as any).default?.default ??
  (LottieModule as any).default ??
  (LottieModule as any).Lottie ??
  (LottieModule as any);

export default function SetupGoals() {
  return (
    <section className="setup-goals">
      <div className="setup-goals-inner">
        <div className="setup-goals-visual-col">
          <div className="setup-goals-visual-border" data-animated="true">
            <div className="setup-goals-visual-box">
              <Lottie animationData={goalsAnimation} loop autoplay style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
        </div>

        <div className="setup-goals-copy-col">
          <h2>
            Setup Goals & <br className="setup-goals-break" /> Track Outcomes
          </h2>
          <p>
            Define specific measurable outcomes for completing a purchase, signing up, or viewing a product.
            These goals are tied to in-app events (purchase, add-to-cart, view product, click) and KPIs of
            consideration. This helps you optimize every campaign based on actual outcomes, not just impressions.
          </p>
        </div>
      </div>
    </section>
  );
}
