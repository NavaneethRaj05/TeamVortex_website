import React from 'react';
import { Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const FloatingTrophy = () => {
  return (
    <Link
      to="/contests"
      className="fixed bottom-6 right-6 w-14 h-14 glass-card rounded-full flex items-center justify-center hover:bg-vortex-blue/20 transition-all duration-300 hover:scale-110 z-40"
      title="View Contests & Leaderboards"
    >
      <Trophy className="h-7 w-7 text-vortex-blue" />
    </Link>
  );
};

export default FloatingTrophy;