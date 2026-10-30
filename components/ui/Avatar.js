// Round profile picture with an initial as fallback. Plain <img> on purpose: it never crashes on an unexpected host.
export default function Avatar({ url, name = '', size = 40, className = '' }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase() || '?';
  const style = { width: size, height: size, fontSize: Math.max(12, Math.round(size * 0.42)) };
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={name ? `${name}'s profile picture` : 'Profile picture'} width={size} height={size} style={style} loading="lazy" className={`shrink-0 rounded-full object-cover ${className}`} />
  ) : (
    <span aria-hidden style={style} className={`grid shrink-0 place-items-center rounded-full bg-navy-900 font-bold text-white ${className}`}>{initial}</span>
  );
}
