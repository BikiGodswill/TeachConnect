'use client';

// Last-resort boundary: renders its own <html> because the root layout failed. Uses plain CSS only.
export default function GlobalError({ reset }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', display: 'grid', placeItems: 'center', minHeight: '100vh', margin: 0, background: '#F3F8FF', color: '#0B1437' }}>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <h1>Teacher Connect hit a problem</h1>
          <p>Please try again. If it keeps happening, contact support.</p>
          <button onClick={reset} style={{ marginTop: 16, padding: '12px 28px', borderRadius: 999, border: 0, background: '#1FA891', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Try again</button>
        </div>
      </body>
    </html>
  );
}
