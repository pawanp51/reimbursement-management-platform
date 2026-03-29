import { MoonStar, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';

  return (
    <motion.div whileTap={{ scale: 0.95 }}>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full border border-white/25 bg-white/55 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/60"
        onClick={onToggle}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
      </Button>
    </motion.div>
  );
}
