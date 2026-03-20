import blog1 from '../../assets/blog1.png';
import blog2 from '../../assets/blog2.png';

import './BlogSection.css';

const blogPosts = [
  {
    id: 1,
    title: '5 Ways To Increase App Retention',
    excerpt:
      'With AppStorys, deliver cutting-edge user experiences with top-notch security. Our lightweight, secure SDK helps your app grow while protecting user data with end...',
    image: blog1,
  },
  {
    id: 2,
    title: '5 Ways Stories Can Help You Increase App Engagement',
    excerpt:
      'With AppStorys, deliver cutting-edge user experiences with top-notch security. Our lightweight, secure SDK helps your app grow while protecting user data with end...',
    image: blog2,
  },
];

export default function BlogSection() {
  return (
    <section className="blog-section">
      <div className="blog-section-inner">
        <div className="blog-section-layout">
          <div className="blog-left">
            <p className="blog-kicker">Blogs</p>
            <h2>
              Read all our
              <br />
              recent articles
            </h2>

            <div className="blog-read-all-wrap">
              <a href="/blogs" className="blog-read-all">
                Read All
                <span aria-hidden="true">◌</span>
              </a>
            </div>
          </div>

          <div className="blog-right">
            <div className="blog-cards">
              {blogPosts.map((post) => (
                <article key={post.id} className="blog-card">
                  <div className="blog-card-image-wrap">
                    <img src={post.image} alt={post.title} className="blog-card-image" />
                  </div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <a href="/blogs" className="blog-read-more">
                    Read more →
                  </a>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
