export type IconName =
  | 'settle' | 'work' | 'grow' | 'belong' | 'thrive' | 'arrow' | 'external' | 'phone' | 'mail' | 'pin' | 'clock'
  | 'calendar' | 'check' | 'alert' | 'menu' | 'close' | 'globe' | 'heart' | 'handshake' | 'building' | 'school'
  | 'landmark' | 'gift' | 'mentor' | 'community' | 'link' | 'quote' | 'video' | 'linkedin' | 'facebook' | 'play'
  | 'youtube' | 'logout' | 'inbox' | 'dashboard' | 'plus' | 'download' | 'key' | 'image';

export default function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return (
    <svg className={`icon ${className}`} aria-hidden="true" focusable="false">
      <use href={`#i-${name}`} />
    </svg>
  );
}
