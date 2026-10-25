import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaYoutube, FaLinkedinIn } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import Logo from '@/components/ui/Logo';

const cols = [
  { title: 'Teacher Connect', links: [['About', '/about'], ['Find Teachers', '/teachers'], ['Become a Teacher', '/become-a-teacher'], ['How It Works', '/#how-it-works']] },
  { title: 'Support', links: [['Help Center', '/help'], ['Contact', '/contact'], ['Safety', '/safety']] },
  { title: 'Legal', links: [['Privacy', '/privacy'], ['Terms', '/terms'], ['Refund Policy', '/refunds']] },
];

// Social links only appear once real URLs are configured (no dead "#" links).
const socials = [
  [FaFacebookF, 'Facebook', process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK],
  [FaInstagram, 'Instagram', process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM],
  [FaXTwitter, 'X', process.env.NEXT_PUBLIC_SOCIAL_X],
  [FaYoutube, 'YouTube', process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE],
  [FaLinkedinIn, 'LinkedIn', process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN],
].filter(([, , url]) => url);

export default function SiteFooter() {
  return (
    <footer className="bg-gradient-to-b from-sky-50 to-lavender-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-5">
        <div className={socials.length ? 'md:col-span-2' : 'md:col-span-3'}>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-ink-600">Qualified teachers. Personalized learning. Online or in person.</p>
          <p className="mt-6 text-xs text-ink-400">© {new Date().getFullYear()} Teacher Connect. All rights reserved.</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="mb-4 text-sm font-bold">{c.title}</h4>
            <ul className="space-y-3">
              {c.links.map(([label, href]) => (
                <li key={label}><Link href={href} className="text-sm text-ink-600 transition hover:text-teal-500">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
        {socials.length > 0 && (
          <div>
            <h4 className="mb-4 text-sm font-bold">Follow us</h4>
            <div className="flex flex-wrap gap-3">
              {socials.map(([Icon, name, url]) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={name}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white text-navy-900 shadow-card transition hover:-translate-y-1 hover:bg-brand-gradient hover:text-white">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
