import * as LottieModule from 'lottie-react';

import frequencyAnimation from '../../assets/fnsglottie.json';
import './FrequencyAndScheduling.css';

const Lottie =
  (LottieModule as any).default?.default ??
  (LottieModule as any).default ??
  (LottieModule as any).Lottie ??
  (LottieModule as any);

export default function FrequencyAndScheduling() {
  return (
    <section className="frequency-scheduling" id="controls-container">
      <div className="frequency-scheduling-inner" id="switch-container">
        <h2 id="switch-label-text">Frequency & Scheduling</h2>
        <p>
          Control how often users see your campaign, show it just once, repeat it daily, weekly, or monthly,
          or create custom rules like up to 5 times a day or only after 2 days of last view. Set triggers based
          on views, clicks, interactions, or specific events. You can also schedule start and end dates, with
          time zone support to match user locations. For the best experience, limit views to avoid user fatigue
          like showing promos a few times a week or resetting after clicks.
        </p>

        <div className="frequency-scheduling-visual-wrap" id="notification-toggle-switch">
          <div className="frequency-scheduling-visual">
            <Lottie animationData={frequencyAnimation} loop autoplay style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
      </div>
    </section>
  );
}
