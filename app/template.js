'use client';
import { motion } from 'framer-motion';

// Re-mounts on every navigation for a soft fade. Opacity only: a transform here would
// break position:fixed children (mobile bottom nav, sticky booking bar).
export default function Template({ children }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
      {children}
    </motion.div>
  );
}
