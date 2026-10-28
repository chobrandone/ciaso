import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { addAdmin, changePassword, removeAdmin } from '../../actions';
import { ConfirmButton, Notice } from '../ui';

export const metadata = { title: 'Account & admins' };

export default async function AccountPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const [session, sp] = await Promise.all([requireAdmin(), searchParams]);
  const admins = await query<{ id: number; name: string; email: string; last_login_at: string | null }>('SELECT id, name, email, last_login_at FROM admins ORDER BY name');
  return (
    <>
      <div className="admin-head"><div><h1>Account &amp; admins</h1><p>Change your password and manage who can sign in to this dashboard.</p></div></div>
      <Notice params={sp} />
      <div className="admin-grid-2">
        <section className="panel" aria-labelledby="admins-title">
          <h2 id="admins-title">Admin accounts</h2>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Name</th><th>Last sign-in</th><th><span className="visually-hidden">Actions</span></th></tr></thead>
              <tbody>
                {admins.map((a) => (
                  <tr key={a.id}>
                    <td><strong>{a.name}</strong>{String(a.id) === session.sub && <> <span className="pill pill--muted">You</span></>}<div className="muted">{a.email}</div></td>
                    <td className="muted">{a.last_login_at ? new Date(a.last_login_at + 'Z').toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Edmonton' }) : 'Never'}</td>
                    <td className="actions">
                      {String(a.id) !== session.sub && (
                        <form action={removeAdmin} className="inline-form">
                          <input type="hidden" name="id" value={a.id} />
                          <ConfirmButton message={`Remove ${a.name}’s admin access?`}>Remove</ConfirmButton>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h2 style={{ marginTop: '1.5rem' }}>Add an admin</h2>
          <form action={addAdmin} className="admin-form">
            <div className="row">
              <div className="field"><label htmlFor="a-name">Name</label><input className="input" id="a-name" name="name" required maxLength={120} /></div>
              <div className="field"><label htmlFor="a-email">Email</label><input className="input" id="a-email" name="email" type="email" required /></div>
            </div>
            <div className="field">
              <label htmlFor="a-password">Temporary password</label>
              <input className="input" id="a-password" name="password" type="password" required minLength={12} autoComplete="new-password" />
              <p className="hint">At least 12 characters. Share it privately and ask them to change it after signing in.</p>
            </div>
            <div className="form-actions"><button className="btn btn--primary btn--sm" type="submit">Add admin</button></div>
          </form>
        </section>

        <section className="panel" aria-labelledby="pw-title">
          <h2 id="pw-title">Change your password</h2>
          <form action={changePassword} className="admin-form">
            <div className="field"><label htmlFor="current">Current password</label><input className="input" id="current" name="current" type="password" required autoComplete="current-password" /></div>
            <div className="field"><label htmlFor="next">New password</label><input className="input" id="next" name="next" type="password" required minLength={12} autoComplete="new-password" /><p className="hint">At least 12 characters.</p></div>
            <div className="field"><label htmlFor="confirm">Confirm new password</label><input className="input" id="confirm" name="confirm" type="password" required minLength={12} autoComplete="new-password" /></div>
            <div className="form-actions"><button className="btn btn--primary btn--sm" type="submit">Change password</button></div>
          </form>
        </section>
      </div>
    </>
  );
}
