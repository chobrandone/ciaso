import Link from 'next/link';
import type { StoryRow } from '@/lib/data';
import { deleteStory, saveStory } from '../../actions';
import { ConfirmButton } from '../ui';

const categoryOptions = [['newcomer', 'Newcomer journeys'], ['career', 'Career & employment'], ['skills', 'Workshops & skills'], ['mentorship', 'Mentorship'], ['community', 'Community']];

export default function StoryForm({ story }: { story?: StoryRow }) {
  const cats = (story?.categories ?? '').split(/\s+/);
  return (
    <>
      <form action={saveStory} className="panel admin-form">
        {story && <input type="hidden" name="id" value={story.id} />}
        <div className="row">
          <div className="field">
            <label htmlFor="name">Name as it should appear <span className="req">*</span></label>
            <input className="input" id="name" name="name" required maxLength={120} defaultValue={story?.name} />
            <p className="hint">Use only what the participant agreed to (e.g. first name only).</p>
          </div>
          <div className="field">
            <label htmlFor="location">Location or role <span className="optional">(optional)</span></label>
            <input className="input" id="location" name="location" maxLength={120} placeholder="Edmonton / Workshop participant" defaultValue={story?.location ?? ''} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="theme">Headline <span className="req">*</span></label>
          <input className="input" id="theme" name="theme" required maxLength={160} placeholder="From uncertainty to confidence." defaultValue={story?.theme} />
        </div>
        <div className="field">
          <label htmlFor="quote">Story / quote <span className="req">*</span></label>
          <textarea className="textarea" id="quote" name="quote" required maxLength={5000} style={{ minHeight: 200 }} defaultValue={story?.quote} />
          <p className="hint">Use the participant’s own words. Leave a blank line between paragraphs. Mark shortened parts with “…”.</p>
        </div>
        <div className="row row--3">
          <div className="field">
            <label htmlFor="tags">Tags <span className="optional">(comma separated)</span></label>
            <input className="input" id="tags" name="tags" maxLength={200} placeholder="Career, Mentorship" defaultValue={story?.tags ?? ''} />
          </div>
          <div className="field">
            <label htmlFor="lang">Language</label>
            <select className="select" id="lang" name="lang" defaultValue={story?.lang ?? 'en'}><option value="en">English</option><option value="fr">French</option></select>
          </div>
          <div className="field">
            <label htmlFor="sort_order">Display order</label>
            <input className="input" id="sort_order" name="sort_order" type="number" defaultValue={story?.sort_order ?? 0} />
          </div>
        </div>
        <fieldset className="field">
          <legend>Filter categories</legend>
          <div className="checks">
            {categoryOptions.map(([v, l]) => <label key={v} className="choice"><input type="checkbox" name="categories" value={v} defaultChecked={cats.includes(v)} />{l}</label>)}
          </div>
        </fieldset>
        <label className="choice"><input type="checkbox" name="consent_confirmed" defaultChecked={!!story?.consent_confirmed} />The participant has given consent to publish this story with this name</label>
        <label className="choice"><input type="checkbox" name="featured" defaultChecked={!!story?.featured} />Featured (shown large and first)</label>
        <label className="choice"><input type="checkbox" name="published" defaultChecked={story ? !!story.published : false} />Published on the website</label>
        <div className="form-actions">
          <button className="btn btn--primary" type="submit">{story ? 'Save changes' : 'Create story'}</button>
          <Link className="text-link" href="/admin/stories">Cancel</Link>
        </div>
      </form>
      {story && (
        <form action={deleteStory} className="panel">
          <input type="hidden" name="id" value={story.id} />
          <h2>Delete story</h2>
          <ConfirmButton message={`Delete the story from ${story.name}? This cannot be undone.`}>Delete story</ConfirmButton>
        </form>
      )}
    </>
  );
}
