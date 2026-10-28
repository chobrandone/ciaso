import Link from 'next/link';
import type { EventRow } from '@/lib/data';
import { deleteEvent, deleteEventImage, saveEvent } from '../../actions';
import { ConfirmButton } from '../ui';

const topicOptions = ['Settle', 'Work', 'Grow', 'Belong', 'Thrive'];

export default function EventForm({ ev, gallery = [], past = false }: { ev?: EventRow; gallery?: { id: number }[]; past?: boolean }) {
  const topics = (ev?.topics ?? '').split(',');
  return (
    <>
      <form action={saveEvent} className="panel admin-form" encType="multipart/form-data">
        {ev && <input type="hidden" name="id" value={ev.id} />}
        {!ev && (
          <p className="notice notice--ok" style={{ margin: 0 }}>
            {past ? 'Adding a past event: choose a date before today and it will appear under Past events.' : 'Adding a current event: choose today or a future date and it will appear under Current events.'}
          </p>
        )}
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
          <textarea className="textarea" id="body" name="body" maxLength={20000} style={{ minHeight: 280, fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '0.875rem' }} defaultValue={ev?.body ?? ''} />
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
          <legend>Flyer image <span className="optional">(JPG, PNG or WebP, up to 5 MB)</span></legend>
          {ev?.has_image ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/media/events/${ev.id}?v=${encodeURIComponent(ev.updated_at)}`} alt="Current flyer" style={{ width: 140, borderRadius: 8, border: '1px solid var(--line)' }} />
              <label className="choice"><input type="checkbox" name="remove_image" />Remove current flyer</label>
            </div>
          ) : null}
          <label htmlFor="image" className="hint">{ev?.has_image ? 'Upload a new flyer to replace it:' : 'Upload the event flyer or a photo:'}</label>
          <input className="input" id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" />
        </fieldset>

        <fieldset className="field">
          <legend>Photo gallery <span className="optional">(optional – e.g. photos from the day, other-language flyers)</span></legend>
          <label htmlFor="gallery" className="hint">Add one or more photos:</label>
          <input className="input" id="gallery" name="gallery" type="file" accept="image/jpeg,image/png,image/webp" multiple />
        </fieldset>

        <fieldset className="field">
          <legend>Pillars</legend>
          <div className="checks">
            {topicOptions.map((t) => <label key={t} className="choice"><input type="checkbox" name="topics" value={t} defaultChecked={topics.includes(t)} />{t}</label>)}
          </div>
        </fieldset>
        <label className="choice"><input type="checkbox" name="published" defaultChecked={ev ? !!ev.published : true} />Published on the website</label>
        <div className="form-actions">
          <button className="btn btn--primary" type="submit">{ev ? 'Save changes' : 'Create event'}</button>
          {ev && <a className="text-link" href={`/events/${ev.id}`} target="_blank" rel="noopener">View on website ↗</a>}
          <Link className="text-link" href="/admin/events">Cancel</Link>
        </div>
      </form>

      {ev && gallery.length > 0 && (
        <section className="panel" aria-labelledby="gallery-title">
          <h2 id="gallery-title">Gallery photos</h2>
          <ul className="admin-gallery" role="list">
            {gallery.map((g) => (
              <li key={g.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/media/event-images/${g.id}`} alt="" />
                <form action={deleteEventImage}>
                  <input type="hidden" name="id" value={g.id} />
                  <input type="hidden" name="event_id" value={ev.id} />
                  <ConfirmButton message="Remove this photo?">Remove</ConfirmButton>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}

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
