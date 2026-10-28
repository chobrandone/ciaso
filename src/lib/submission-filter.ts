import { labels } from './validation';

export type SubmissionSearch = { type?: string; status?: string; q?: string; page?: string; deleted?: string; saved?: string; error?: string };

/** Builds a parameterized WHERE clause for the enquiries list and CSV export. */
export function buildSubmissionFilter(sp: SubmissionSearch) {
  const where: string[] = [];
  const args: string[] = [];
  if (sp.type && sp.type in labels.type) { where.push('type = ?'); args.push(sp.type); }
  if (sp.status && sp.status in labels.status) { where.push('status = ?'); args.push(sp.status); }
  if (sp.q?.trim()) {
    where.push('(name LIKE ? OR email LIKE ? OR organization LIKE ? OR message LIKE ?)');
    const like = `%${sp.q.trim()}%`;
    args.push(like, like, like, like);
  }
  return { sql: where.length ? `WHERE ${where.join(' AND ')}` : '', args };
}
