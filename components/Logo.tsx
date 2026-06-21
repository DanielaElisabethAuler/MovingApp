/* eslint-disable @next/next/no-img-element */
// Logo auf weissem Badge (das SVG hat weissen Hintergrund) — passt auf das
// dunkle Theme. Wird in Header, Login und Onboarding genutzt.
export function Logo({ size = 40 }: { size?: number }) {
  return (
    <span className="logo-badge" style={{ width: size, height: size }}>
      <img src="/logo.svg" alt="Felicurv" width={size} height={size} />
    </span>
  );
}
