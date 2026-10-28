import type { ReactNode } from 'react';

/**
 * Renders the simple text format used for event details:
 * blank lines separate blocks, "## " starts a heading, "- " starts a list item.
 */
export default function RichText({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  let para: string[] = [];
  let list: string[] = [];
  const flushPara = () => { if (para.length) { blocks.push(<p key={blocks.length}>{para.join(' ')}</p>); para = []; } };
  const flushList = () => { if (list.length) { blocks.push(<ul key={blocks.length}>{list.map((l, i) => <li key={i}>{l}</li>)}</ul>); list = []; } };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushPara(); flushList(); continue; }
    if (line.startsWith('## ')) { flushPara(); flushList(); blocks.push(<h2 key={blocks.length}>{line.slice(3)}</h2>); continue; }
    if (/^[-*•]\s+/.test(line)) { flushPara(); list.push(line.replace(/^[-*•]\s+/, '')); continue; }
    flushList();
    para.push(line);
  }
  flushPara(); flushList();
  return <div className="rich-text">{blocks}</div>;
}
