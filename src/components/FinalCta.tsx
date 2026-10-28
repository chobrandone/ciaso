import Link from 'next/link';
import Icon from './Icon';
import { delay } from '@/lib/ui';
import { getContent } from '@/lib/content';

export default async function FinalCta() {
  const { cta } = await getContent();
  return (
    <section className="section final-cta" aria-labelledby="final-cta-title">
      <div className="container final-cta__inner">
        <div className="final-cta__copy reveal reveal--left">
          <p className="eyebrow eyebrow--light">{cta.eyebrow}</p>
          <h2 id="final-cta-title" className="final-cta__title">{cta.title}</h2>
          {cta.text && <p>{cta.text}</p>}
        </div>
        <ul className="pathways" role="list">
          {cta.items.map((p, i) => (
            <li key={i} className="reveal reveal--right" style={delay(i * 0.08)}>
              <Link className={`pathway${i === 0 ? ' pathway--primary' : ''}`} href={p.href || '/'}>
                <span className="pathway__label">{p.label}</span>
                {p.hint && <span className="pathway__hint">{p.hint}</span>}
                <Icon name="arrow" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
