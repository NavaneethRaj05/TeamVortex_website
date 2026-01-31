import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Instagram, Mail } from 'lucide-react';
import API_BASE_URL from '../apiConfig';

const Team = () => {
  const [activeCategory, setActiveCategory] = useState('core');
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'faculty', name: 'Faculty Advisors' },
    { id: 'core', name: 'Core Team' },
    { id: 'technical', name: 'Technical & Projects' },
    { id: 'creative', name: 'Events & Media' },
    { id: 'editorial', name: 'Editorial' },
  ];

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/team`);
        const data = await res.json();
        setTeamMembers(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching team:', err);
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const getMembersByCategory = (category) => {
    return teamMembers.filter(member => member.category === category);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
            <span className="gradient-text">OUR TEAM</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Meet the brilliant minds behind Team Vortex.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-8 py-4 rounded-2xl font-medium transition-all duration-300 ${activeCategory === category.id
                ? 'bg-gradient-to-r from-vortex-blue to-cyan-400 text-black shadow-lg'
                : 'glass-card text-white/80 hover:text-vortex-blue hover:bg-white/10'
                }`}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* Team Members Grid */}
        {loading ? (
          <div className="text-center text-white/50">Loading Team Data...</div>
        ) : (
          <motion.div
            key={activeCategory}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {getMembersByCategory(activeCategory).length > 0 ? (
              getMembersByCategory(activeCategory).map((member) => (
                <motion.div
                  key={member._id}
                  variants={itemVariants}
                  className="team-card group"
                >
                  <div className="w-28 h-28 mx-auto mb-6 relative">
                    <div className="w-full h-full bg-gradient-to-br from-vortex-blue via-cyan-400 to-vortex-orange rounded-2xl p-0.5">
                      <div className="w-full h-full rounded-2xl bg-dark-bg flex items-center justify-center">
                        <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-2xl font-bold text-vortex-blue backdrop-blur-sm">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-vortex-blue transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-vortex-blue text-sm mb-6 font-medium">{member.role}</p>

                  <div className="flex justify-center space-x-4">
                    {member.linkedin && (
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 glass-card rounded-xl flex items-center justify-center hover:bg-vortex-blue/20 transition-all duration-300 hover:scale-110">
                        <Linkedin className="h-5 w-5 text-white" />
                      </a>
                    )}
                    {member.instagram && (
                      <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 glass-card rounded-xl flex items-center justify-center hover:bg-vortex-blue/20 transition-all duration-300 hover:scale-110">
                        <Instagram className="h-5 w-5 text-white" />
                      </a>
                    )}
                    {member.email && (
                      <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${member.email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 glass-card rounded-xl flex items-center justify-center hover:bg-vortex-blue/20 transition-all duration-300 hover:scale-110"
                        title={`Email ${member.name}`}
                      >
                        <Mail className="h-5 w-5 text-white" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center text-white/30 py-10">No members found in this category.</div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Team;