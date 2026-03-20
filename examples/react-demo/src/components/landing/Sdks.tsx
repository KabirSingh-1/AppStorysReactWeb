import s1 from '../../assets/s1.png';
import s2 from '../../assets/s2.png';
import s3 from '../../assets/s3.png';
import s4 from '../../assets/s4.png';
import s5 from '../../assets/s5.png';
import s6 from '../../assets/s6.png';

import './Sdks.css';

const sdks = [
  { name: 'iOS Native', icon: s1 },
  { name: 'Android Native', icon: s2 },
  { name: 'React Native SDK', icon: s3 },
  { name: 'Angular SDK', icon: s4 },
  { name: 'React.js SDK', icon: s5 },
  { name: 'Flutter SDK', icon: s6 },
];

export default function Sdks() {
  return (
    <section className="sdks">
      <div className="sdks-inner">
        <div className="sdks-header">
          <p className="sdks-kicker">Powerful Plug & Play</p>
          <h2>Enterprise-Ready SDKs</h2>
          <p>
            Install our SDK in less than 30 minutes and use our dashboards that say a lot more than just graphs.
          </p>
        </div>

        <div className="sdks-grid">
          {sdks.map((sdk) => (
            <div key={sdk.name} className="sdks-card">
              <img src={sdk.icon} alt={`${sdk.name} SDK`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
