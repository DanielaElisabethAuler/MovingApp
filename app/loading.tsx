// Lade-Screen beim Seitenwechsel: vervou-Logo mittig, smooth ein- und ausblenden.
export default function Loading() {
  return (
    <div className="route-loading">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon.svg" alt="" width={120} height={120} />
    </div>
  );
}
