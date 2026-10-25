import Link from 'next/link';
import { LuCalculator, LuAtom, LuFlaskConical, LuDna, LuBookOpen, LuLanguages, LuLaptop, LuSigma, LuBookMarked } from 'react-icons/lu';

const icons = { calculator: LuCalculator, atom: LuAtom, flask: LuFlaskConical, dna: LuDna, book: LuBookOpen, languages: LuLanguages, laptop: LuLaptop, sigma: LuSigma };
const tints = ['bg-lavender-100', 'bg-peach-100', 'bg-sky-100', 'bg-brandyellow-100', 'bg-teal-100'];

// Static fallback list so the section renders before the DB is connected (counts omitted then).
const FALLBACK = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'French', 'Computer Science', 'Additional Mathematics']
  .map((name, i) => ({ id: name, name, icon: ['calculator', 'atom', 'flask', 'dna', 'book', 'languages', 'laptop', 'sigma'][i], teacherCount: null }));

export default function SubjectGrid({ subjects }) {
  const list = subjects?.length ? subjects : FALLBACK;
  return (
    <section id="subjects" className="section">
      <div className="text-center"><h2 className="section-title squiggle">Explore Subjects</h2></div>
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((s, i) => {
          const Icon = icons[s.icon] || LuBookMarked;
          return (
            <Link key={s.id} href={`/teachers?subject=${encodeURIComponent(s.name)}`}
              className={`${tints[i % tints.length]} group flex items-center gap-4 rounded-full px-5 py-4 transition hover:-translate-y-1 hover:shadow-card`}>
              <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-navy-900"><Icon size={22} /></span>
              <span>
                <span className="block text-sm font-bold">{s.name}</span>
                {s.teacherCount !== null && <span className="text-xs text-ink-600">{s.teacherCount} teacher{s.teacherCount === 1 ? '' : 's'}</span>}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
