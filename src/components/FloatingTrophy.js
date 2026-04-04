import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const FloatingTrophy = () => {
  const location = useLocation();
  const [modalOpen, setModalOpen] = useState(false);

  // Hide when registration modal is open (body gets modal-open class)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setModalOpen(document.body.classList.contains('modal-open'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (location.pathname.startsWith('/dashboard')) return null;
  if (modalOpen) return null;

  return (
    <Link
      to="/contests"
      className="fixed z-40 touch-manipulation shadow-lg
        bottom-6 right-4
        sm:bottom-6 sm:right-24
        w-12 h-12 sm:w-14 sm:h-14
        glass-card rounded-full
        flex items-center justify-center
        active:bg-vortex-blue/30 sm:hover:bg-vortex-blue/20
        active:scale-95 sm:hover:scale-110 transition-all duration-300"
      title="View Contests"
    >
      <Trophy className="h-6 w-6 sm:h-7 sm:w-7 text-vortex-blue" />
    </Link>
  );
};

export default FloatingTrophy;
