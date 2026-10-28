/**
 * Branded splash shown while the first page loads. Pure CSS: it fades itself out,
 * so it can never get stuck, even without JavaScript. Decorative, hidden from screen readers.
 */
export default function PageLoader({ logo }: { logo: string }) {
  return (
    <div className="page-loader" aria-hidden="true">
      <div className="page-loader__inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="page-loader__logo" src={logo} width={174} height={91} alt="" />
        <span className="page-loader__bar" />
      </div>
    </div>
  );
}
