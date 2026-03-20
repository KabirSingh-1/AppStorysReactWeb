import i1 from '../../assets/i1.png';
import i2 from '../../assets/i2.png';
import i3 from '../../assets/i3.png';
import i4 from '../../assets/i4.png';
import i5 from '../../assets/i5.png';
import i6 from '../../assets/i6.png';
import i7 from '../../assets/i7.png';
import i8 from '../../assets/i8.png';
import i9 from '../../assets/i9.png';
import i10 from '../../assets/i10.png';
import i11 from '../../assets/i11.png';
import i12 from '../../assets/i12.png';

import './Integrations.css';

const partners = [
  { name: 'CleverTap', logo: i1 },
  { name: 'Amplitude', logo: i2 },
  { name: 'MoEngage', logo: i3 },
  { name: 'MParticle', logo: i4 },
  { name: 'MixPanel', logo: i5 },
  { name: 'Optimizely', logo: i6 },
  { name: 'Amazon Redshift', logo: i7 },
  { name: 'Airship', logo: i8 },
  { name: 'Braze', logo: i9 },
  { name: 'WebEngage', logo: i10 },
  { name: 'Pendo', logo: i11 },
  { name: 'Custom CSV', logo: i12 },
];

export default function Integrations() {
  return (
    <section className="integrations">
      <div className="integrations-inner" id="tags-wrapper">
        <div className="integrations-header" id="icon-buttons-row">
          <p className="integrations-kicker" id="warning-notification">Technology Partners</p>
          <h2 id="warning-message">Our Integrations</h2>
          <p className="integrations-subcopy">
            We have deep integrations with the largest technology partners for events data flow in real time.
          </p>
        </div>

        <div className="integrations-grid" id="dashed-border-view">
          {partners.map((partner, index) => {
            // Assign remaining IDs to existing grid items for coordinates referencing
            let itemId: string | undefined = undefined;
            if (index === 0) itemId = 'red-tag';
            else if (index === 1) itemId = 'teal-tag';
            else if (index === 2) itemId = 'blue-tag';
            else if (index === 3) itemId = 'like-button';
            else if (index === 4) itemId = 'share-button';
            else if (index === 5) itemId = 'save-button';

            return (
              <div key={partner.name} className="integrations-item" id={itemId}>
                <img src={partner.logo} alt={partner.name} />
              </div>
            );
          })}
        </div>

        <p className="integrations-footcopy" id="placeholder-content">
          We offer comprehensive CDP integration capabilities, supporting webhooks, API endpoints, and a variety
          of other data ingestion protocols. Our architecture is designed for real-time data processing, ensuring
          minimal latency. If you require specialized integration solutions, we can work directly with your CDP
          provider to develop a tailored approach.
        </p>
      </div>
    </section>
  );
}
