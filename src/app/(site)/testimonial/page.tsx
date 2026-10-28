import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import StoryCard from '@/components/StoryCard';
import ShareBar from '@/components/ShareBar';
import { getStories } from '@/lib/data';
import { getContent } from '@/lib/content';
import { headerMetadata } from '@/lib/page-meta';
import { site } from '@/lib/site';

export const generateMetadata = () => headerMetadata('testimonial', '/testimonial');

export default async function TestimonialPage() {
  const [stories, { testimonial, brand }] = await Promise.all([getStories(), getContent()]);
  return (
    <>
      <PageHeader crumb="Testimonial" header={testimonial.header}>
        <ShareBar url={`${site.url}/testimonial`} />
      </PageHeader>

      <section className="section">
        <div className="container">
          <div className="stories">
            {stories.map((s) => <StoryCard key={s.id} story={s} wide={!!s.featured} className="reveal" />)}
          </div>
        </div>
      </section>

      <section className="section section--surface" id="share" aria-labelledby="share-title">
        <div className="container container--narrow reveal" style={{ textAlign: 'center' }}>
          <p className="eyebrow">{brand.hashtag}</p>
          <h2 id="share-title">{testimonial.shareTitle}</h2>
          <p className="lead">{testimonial.shareText}</p>
          <div className="btn-row" style={{ justifyContent: 'center' }}><Link className="btn btn--primary" href="/contact?topic=story">Share Your Story</Link></div>
        </div>
      </section>
    </>
  );
}
