import Link from 'next/link';
import type { EventRow } from '@/lib/data';
import { MAX_EVENT_PHOTOS } from '@/lib/ui';
import { deleteEvent, saveEvent } from '../../actions';
import { ConfirmButton } from '../ui';
import FormTabs from '../FormTabs';
import ImagePicker from '../ImagePicker';
import UploadSizeGuard from '@/components/UploadSizeGuard';
import { PLACEHOLDER_CAPTION } from '../../../../../db/seed.mjs';

const topicOptions = ['Settle', 'Work', 'Grow', 'Belong', 'Thrive'];

export default function EventForm({ ev, gallery = [], past = false }: { ev?: EventRow; gallery?: { id: number; caption?: string | null }[]; past?: boolean }) {
  const topics = (ev?.topics ?? '').split(',');
  const isPlaceholder = (g: { caption?: string | null }) => g.caption === PLACEHOLDER_CAPTION;
  const real = gallery.filter((g) => !isPlaceholder(g)).length;
  // Placeholder images count as free slots: uploading real photos replaces them
  const free = Math.max(0, MAX_EVENT_PHOTOS - real);
  return (
    <>
      <form action={saveEvent} className="panel admin-form" encType="multipart/form-data">
        <UploadSizeGuard />
        {ev && <input type="hidden" name="id" value={ev.id} />}
        {!ev && (
          <p className="notice notice--ok" style={{ margin: 0 }}>
            {past ? 'Adding a past event: choose a date before today and it will appear under Past events.' : 'Adding a current event: choose today or a future date and it will appear under Current events.'}
          </p>
        )}

        <FormTabs tabs={['1. Event details', `2. Flyer & photos (${real}/${MAX_EVENT_PHOTOS})`, `3. Recap & links${ev?.recap || ev?.recap_body ? ' ✓' : ''}`]}>
          <>
            <div className="row">
              <div className="field">
                <label htmlFor="kind">Type <span className="req">*</span></label>
                <select className="select" id="kind" name="kind" defaultValue={ev?.kind ?? 'workshop'}>
                  <option value="workshop">Workshop (also listed on the Workshop page)</option>
                  <option value="event">Event</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="title">Title <span className="req">*</span></label>
                <input className="input" id="title" name="title" required maxLength={200} defaultValue={ev?.title} />
              </div>
            </div>
            <div className="row row--3">
              <div className="field">
                <label htmlFor="date">Date <span className="req">*</span></label>
                <input className="input" id="date" name="date" type="date" required defaultValue={ev?.date} />
              </div>
              <div className="field">
                <label htmlFor="time_text">Time <span className="optional">(optional)</span></label>
                <input className="input" id="time_text" name="time_text" placeholder="7:00–8:30 p.m. MT" maxLength={80} defaultValue={ev?.time_text ?? ''} />
              </div>
              <div className="field">
                <label htmlFor="date_text">Show date as <span className="optional">(optional)</span></label>
                <input className="input" id="date_text" name="date_text" placeholder="e.g. October 2025" maxLength={80} defaultValue={ev?.date_text ?? ''} />
              </div>
            </div>
            <div className="row row--3">
              <div className="field">
                <label htmlFor="format">Format <span className="optional">(optional)</span></label>
                <input className="input" id="format" name="format" placeholder="Online via Zoom / In person" maxLength={120} defaultValue={ev?.format ?? ''} />
              </div>
              <div className="field">
                <label htmlFor="location">Location <span className="optional">(optional)</span></label>
                <input className="input" id="location" name="location" maxLength={200} defaultValue={ev?.location ?? ''} />
              </div>
              <div className="field">
                <label htmlFor="speaker">Speaker(s) <span className="optional">(optional)</span></label>
                <input className="input" id="speaker" name="speaker" maxLength={200} placeholder="Name & Name" defaultValue={ev?.speaker ?? ''} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="description">Short summary <span className="req">*</span></label>
              <textarea className="textarea" id="description" name="description" required maxLength={600} style={{ minHeight: 80 }} defaultValue={ev?.description} />
              <p className="hint">One or two sentences, shown on event cards.</p>
            </div>
            <div className="field">
              <label htmlFor="body">Full details <span className="optional">(optional)</span></label>
              <textarea className="textarea" id="body" name="body" maxLength={20000} style={{ minHeight: 240, fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '0.875rem' }} defaultValue={ev?.body ?? ''} />
              <p className="hint">Shown on the event’s own page. Leave a blank line between paragraphs. Start a line with <code>## </code> for a heading and <code>- </code> for a bullet point. Don’t post Zoom passcodes publicly – share them with registered participants.</p>
            </div>
            <div className="row">
              <div className="field">
                <label htmlFor="eligibility">Who can attend <span className="optional">(optional)</span></label>
                <input className="input" id="eligibility" name="eligibility" maxLength={200} defaultValue={ev?.eligibility ?? ''} />
              </div>
              <div className="field">
                <label htmlFor="deadline">Registration deadline <span className="optional">(optional)</span></label>
                <input className="input" id="deadline" name="deadline" type="date" defaultValue={ev?.deadline ?? ''} />
              </div>
            </div>
            <div className="row">
              <div className="field">
                <label htmlFor="register_url">Registration link <span className="optional">(optional)</span></label>
                <input className="input" id="register_url" name="register_url" type="url" placeholder="https://" defaultValue={ev?.register_url ?? ''} />
                <p className="hint">Shows a Register button while the event is current (Eventbrite, Google Forms, Zoom…).</p>
              </div>
              <div className="field">
                <label htmlFor="details_url">Reference link <span className="optional">(optional, admin only)</span></label>
                <input className="input" id="details_url" name="details_url" type="url" placeholder="https://" defaultValue={ev?.details_url ?? ''} />
              </div>
            </div>
            <fieldset className="field">
              <legend>Pillars</legend>
              <div className="checks">
                {topicOptions.map((t) => <label key={t} className="choice"><input type="checkbox" name="topics" value={t} defaultChecked={topics.includes(t)} />{t}</label>)}
              </div>
            </fieldset>
            <label className="choice"><input type="checkbox" name="published" defaultChecked={ev ? !!ev.published : true} />Published on the website</label>
          </>

          <>
            <p className="tab-intro">The flyer is the main picture on the event card. Photos appear in a gallery on the event’s page – ideal for past events. Large photos are made smaller automatically before upload.</p>
            <fieldset className="field">
              <legend>Flyer</legend>
              {ev?.has_image ? (
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/media/events/${ev.id}?v=${encodeURIComponent(ev.updated_at)}`} alt="Current flyer" style={{ width: 160, borderRadius: 8, border: '1px solid var(--line)' }} />
                  <label className="choice"><input type="checkbox" name="remove_image" />Remove this flyer</label>
                </div>
              ) : <p className="hint" style={{ margin: 0 }}>No flyer yet.</p>}
              <ImagePicker name="image" id="image" label={ev?.has_image ? 'Replace flyer' : 'Choose flyer'} />
            </fieldset>

            <fieldset className="field">
              <legend>Event photos <span className="optional">(up to {MAX_EVENT_PHOTOS} per event)</span></legend>
              <ul className="photo-slots" role="list">
                {gallery.map((g, i) => (
                  <li key={g.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/media/event-images/${g.id}`} alt={`Photo ${i + 1}`} />
                    {isPlaceholder(g) && <span className="pill pill--muted">Placeholder</span>}
                    <label className="choice"><input type="checkbox" name="remove_photo" value={g.id} />Remove</label>
                  </li>
                ))}
                {Array.from({ length: Math.max(0, MAX_EVENT_PHOTOS - gallery.length) }, (_, i) => (
                  <li key={`empty-${i}`}><span className="photo-slot--empty">Empty slot</span></li>
                ))}
              </ul>
              <ImagePicker name="gallery" id="gallery" max={free}
                label={free ? `Add photos (${free} free slot${free > 1 ? 's' : ''})` : 'All 6 slots are used'} />
              {real < gallery.length && <p className="hint" style={{ margin: 0 }}>This event shows placeholder images for now. Add real photos and the placeholders are removed automatically.</p>}
              {!free && <p className="hint" style={{ margin: 0 }}>To add new photos, tick “Remove” on some, click Save, then add the new ones.</p>}
            </fieldset>
          </>

          <>
            <p className="tab-intro">After the event, tell people how it went. When an event is past, its page shows this recap first, then the photos, then buttons to the full post on LinkedIn and Facebook.</p>
            <div className="field">
              <label htmlFor="recap">Short recap <span className="optional">(1–3 sentences)</span></label>
              <textarea className="textarea" id="recap" name="recap" maxLength={1000} style={{ minHeight: 90 }} defaultValue={ev?.recap ?? ''}
                placeholder="e.g. Over 40 newcomers joined us to learn how to land their first job in Canada…" />
            </div>
            <div className="field">
              <label htmlFor="recap_body">Write-up <span className="optional">(optional)</span></label>
              <textarea className="textarea" id="recap_body" name="recap_body" maxLength={20000} style={{ minHeight: 220 }} defaultValue={ev?.recap_body ?? ''}
                placeholder={'What was covered, key takeaways, thank-yous to speakers and partners…\n\n## Key takeaways\n- First point\n- Second point'} />
              <p className="hint">Leave a blank line between paragraphs. Start a line with <code>## </code> for a heading and <code>- </code> for a bullet point.</p>
            </div>
            <div className="row">
              <div className="field">
                <label htmlFor="linkedin_url">LinkedIn post <span className="optional">(optional)</span></label>
                <input className="input" id="linkedin_url" name="linkedin_url" type="url" placeholder="https://www.linkedin.com/posts/…" defaultValue={ev?.linkedin_url ?? ''} />
              </div>
              <div className="field">
                <label htmlFor="facebook_url">Facebook post <span className="optional">(optional)</span></label>
                <input className="input" id="facebook_url" name="facebook_url" type="url" placeholder="https://www.facebook.com/…" defaultValue={ev?.facebook_url ?? ''} />
              </div>
            </div>
          </>
        </FormTabs>

        <div className="form-actions">
          <button className="btn btn--primary" type="submit">{ev ? 'Save changes' : 'Create event'}</button>
          {ev && <a className="text-link" href={`/events/${ev.id}`} target="_blank" rel="noopener">View on website ↗</a>}
          <Link className="text-link" href="/admin/events">Cancel</Link>
        </div>
      </form>

      {ev && (
        <form action={deleteEvent} className="panel">
          <input type="hidden" name="id" value={ev.id} />
          <h2>Delete event</h2>
          <p className="note">To keep it but hide it from the website, untick “Published” instead.</p>
          <ConfirmButton message={`Delete “${ev.title}” and its photos? This cannot be undone.`}>Delete event</ConfirmButton>
        </form>
      )}
    </>
  );
}
