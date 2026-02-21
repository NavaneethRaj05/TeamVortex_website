import React from 'react';
import { Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const FloatingTrophy = () => {
  return (
    <Link
      to="/contests"
      className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 glass-card rounded-full flex items-center justify-center active:bg-vortex-blue/30 sm:hover:bg-vortex-blue/20 transition-all duration-300 active:scale-95 sm:hover:scale-110 z-40 shadow-lg touch-manipulation"
      title="View Contests & Leaderboards"
    >
      <Trophy className="h-6 w-6 sm:h-7 sm:w-7 text-vortex-blue" />
    </Link>
  );
};

export default FloatingTrophy;