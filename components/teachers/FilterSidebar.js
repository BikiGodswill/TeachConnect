// Plain GET form: works without client JS and keeps filters shareable in the URL.
export default function FilterSidebar({ subjects = [], values = {} }) {
  const field = 'mt-1 h-11 w-full rounded-md border border-ink-200 bg-white px-3 text-sm outline-none focus:border-teal-500';
  const label = 'block text-xs font-bold text-ink-600';
  return (
    <form method="GET" action="/teachers" className="h-fit space-y-5 rounded-xl bg-white p-6 shadow-card lg:sticky lg:top-28">
      <h2 className="text-lg font-bold">Filters</h2>
      <label className={label}>Subject
        <select name="subject" defaultValue={values.subject || ''} className={field}>
          <option value="">All subjects</option>
          {subjects.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
      </label>
      <label className={label}>Location
        <input name="city" defaultValue={values.city || ''} placeholder="e.g. Buea" className={field} />
      </label>
      <label className={label}>Learning mode
        <select name="mode" defaultValue={values.mode || ''} className={field}>
          <option value="">Online or in person</option>
          <option value="ONLINE">Online</option>
          <option value="PHYSICAL">In person</option>
        </select>
      </label>
      <label className={label}>Max price per hour (FCFA)
        <input name="maxPrice" type="number" min="0" step="500" defaultValue={values.maxPrice || ''} className={field} />
      </label>
      <label className={label}>Minimum rating
        <select name="minRating" defaultValue={values.minRating || ''} className={field}>
          <option value="">Any</option><option value="3">3+</option><option value="4">4+</option><option value="4.5">4.5+</option>
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" name="verified" value="1" defaultChecked={values.verified === '1'} className="h-4 w-4 accent-teal-500" /> Verified teachers only
      </label>
      <label className={label}>Sort by
        <select name="sort" defaultValue={values.sort || 'rating'} className={field}>
          <option value="rating">Top rated</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="experience">Most experienced</option>
        </select>
      </label>
      <button className="btn-teal w-full">Apply filters</button>
    </form>
  );
}
