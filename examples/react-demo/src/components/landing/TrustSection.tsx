import t1 from '../../assets/t1.png';
import t2 from '../../assets/t2.png';
import t3 from '../../assets/t3.png';
import t4 from '../../assets/t4.png';

import './TrustSection.css';

const boxImages = [t1, t2, t3, t4];

export default function TrustSection() {
  return (
    <section className="trust-section">
      <div className="trust-section-copy">
        <h2>
          AppStorys is <br />
          trusted by developers globally
        </h2>
      </div>

      <div className="trust-section-grid">
        {boxImages.map((image, index) => (
          <img key={index} src={image} alt={`Certification ${index + 1}`} />
        ))}
      </div>
    </section>
  );
}
