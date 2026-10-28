import type { StoryRow } from '@/lib/data';

/** Shortens long quotes at a word boundary, marking the cut with an ellipsis. */
function excerpt(text: string, max?: number) {
  if (!max || text.length <= max) return text;
  return text.slice(0, text.lastIndexOf(' ', max)).replace(/[\s,;:–-]+$/, '') + '…';
}

export default function StoryCard({ story, wide = false, className = '', maxChars }: { story: StoryRow; wide?: boolean; className?: string; maxChars?: number }) {
  const featured = !!story.featured;
  const paragraphs = excerpt(story.quote, maxChars).split(/\n\s*\n/);
  const fr = story.lang === 'fr';
  return (
    <figure
      className={`story${featured ? ' story--featured' : ''}${wide ? ' story--wide' : ''} ${className}`}
      lang={fr ? 'fr' : undefined}
      data-categories={story.categories ?? ''}
    >
      <p className="story__theme">{story.theme}</p>
      <blockquote>
        {paragraphs.map((p, i) => (
          <p key={i}>
            {i === 0 && (fr ? '« ' : '“')}{p}{i === paragraphs.length - 1 && (fr ? ' »' : '”')}
          </p>
        ))}
      </blockquote>
      {story.tags && (
        <ul className="story__tags" aria-label={fr ? 'Thèmes' : 'Themes'}>
          {story.tags.split(',').map((t) => <li key={t} className="tag">{t.trim()}</li>)}
        </ul>
      )}
      <figcaption><strong>{story.name}</strong>{story.location}</figcaption>
    </figure>
  );
}
