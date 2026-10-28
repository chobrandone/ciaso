import Image from 'next/image';
import Link from 'next/link';
import LoginForm from './LoginForm';
import { getContent } from '@/lib/content';

export const metadata = { title: 'Sign in' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [{ next = '/admin' }, { images }] = await Promise.all([searchParams, getContent()]);
  return (
    <main className="login">
      <div className="login__bg" aria-hidden="true"><Image src="/images/community-group-1600.jpg" alt="" fill sizes="100vw" quality={50} /></div>
      <div className="login__card anim-up">
        <Image src={images.logo} width={174} height={91} alt="CIASO" priority unoptimized={!images.logo.startsWith('/images/')} />
        <h1>Staff sign in</h1>
        <p className="note" style={{ marginBottom: '1.5rem' }}>Manage enquiries, events, stories and videos.</p>
        <LoginForm next={next} />
        <p className="note" style={{ marginTop: '1.5rem', marginBottom: 0 }}><Link href="/">← Back to the website</Link></p>
      </div>
    </main>
  );
}
