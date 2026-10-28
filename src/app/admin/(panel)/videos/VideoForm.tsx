import Link from 'next/link';
import type { VideoRow } from '@/lib/data';
import { deleteVideo, saveVideo } from '../../actions';
import { ConfirmButton } from '../ui';

export default function VideoForm({ video }: { video?: VideoRow }) {
  return (
    <>
      <form action={saveVideo} className="panel admin-form">
        {video && <input type="hidden" name="id" value={video.id} />}
        <div className="field">
          <label htmlFor="youtube">YouTube link or video ID <span className="req">*</span></label>
          <input className="input" id="youtube" name="youtube" required placeholder="https://www.youtube.com/watch?v=… or https://youtube.com/shorts/…"
            defaultValue={video ? `https://www.youtube.com/watch?v=${video.youtube_id}` : ''} />
        </div>
        <div className="field">
          <label htmlFor="title">Title <span className="req">*</span></label>
          <input className="input" id="title" name="title" required maxLength={200} defaultValue={video?.title} />
        </div>
        <div className="field">
          <label htmlFor="description">Short description <span className="optional">(optional)</span></label>
          <textarea className="textarea" id="description" name="description" maxLength={600} defaultValue={video?.description ?? ''} />
        </div>
        <div className="row">
          <div className="field">
            <label htmlFor="source_label">Source label <span className="optional">(optional)</span></label>
            <input className="input" id="source_label" name="source_label" maxLength={120} placeholder="CIASO on YouTube · October 2025" defaultValue={video?.source_label ?? ''} />
          </div>
          <div className="field">
            <label htmlFor="sort_order">Display order</label>
            <input className="input" id="sort_order" name="sort_order" type="number" defaultValue={video?.sort_order ?? 0} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="placement">Show on</label>
          <select className="select" id="placement" name="placement" defaultValue={video?.placement ?? 'home'}>
            <option value="home">Home page – inside “Who we are”</option>
            <option value="about">About page – inside “Who we are”</option>
          </select>
          <p className="hint">Videos appear within the page content, next to the text about CIASO.</p>
        </div>
        <label className="choice"><input type="checkbox" name="is_short" defaultChecked={!!video?.is_short} />This is a vertical YouTube Short</label>
        <label className="choice"><input type="checkbox" name="published" defaultChecked={video ? !!video.published : true} />Published on the website</label>
        <div className="form-actions">
          <button className="btn btn--primary" type="submit">{video ? 'Save changes' : 'Add video'}</button>
          <Link className="text-link" href="/admin/videos">Cancel</Link>
        </div>
      </form>
      {video && (
        <form action={deleteVideo} className="panel">
          <input type="hidden" name="id" value={video.id} />
          <h2>Remove video</h2>
          <p className="note">Removes it from the website only. The video stays on YouTube.</p>
          <ConfirmButton message={`Remove “${video.title}” from the website?`}>Remove video</ConfirmButton>
        </form>
      )}
    </>
  );
}
