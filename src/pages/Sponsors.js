import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ExternalLink, Mail, Phone, Building, Calendar } from 'lucide-react';
import API_BASE_URL from '../apiConfig';

const Sponsors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/sponsors/active`)
      .then(res => res.json())
      .then(res => res.json())
      .then(data => {
        setSponsors(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching sponsors:', err);
        setSponsors([]);
        setLoading(false);
      });
  }, []);

  const sponsorTypes = [
    { id: 'all', name: 'All Sponsors', color: 'text-white' },
    { id: 'title', name: 'Title Sponsor', color: 'text-yellow-400' },
    { id: 'platinum', name: 'Platinum', color: 'text-gray-300' },
    { id: 'gold', name: 'Gold', color: 'text-yellow-500' },
    { id: 'silver', name: 'Silver', color: 'text-gray-400' },
    { id: 'bronze', name: 'Bronze', color: 'text-orange-600' },
    { id: 'media', name: 'Media Partners', color: 'text-purple-400' },
  ];

  const filteredSponsors = Array.isArray(sponsors) ? sponsors.filter(sponsor => {
    const matchesSearch = sponsor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sponsor.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sponsor.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || sponsor.type === selectedType;
    return matchesSearch && matchesType;
  }) : [];

  const getSponsorTypeColor = (type) => {
    const typeObj = sponsorTypes.find(t => t.id === type);
    return typeObj ? typeObj.color : 'text-white';
  };

  const getSponsorTypeIcon = (type) => {
    switch (type) {
      case 'title': return '👑';
      case 'platinum': return '💎';
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      case 'bronze': return '🥉';
      case 'media': return '📺';
      default: return '🏢';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
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
            <span className="gradient-text">OUR SPONSORS</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Meet our amazing partners who support Team Vortex and help us achieve excellence in technology and innovation.
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          {/* Search Bar */}
          <div className="relative mb-6 max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
            <input
              type="text"
              placeholder="Search sponsors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 glass-card border border-dark-border rounded-lg bg-transparent text-white placeholder-white/40 focus:outline-none focus:border-vortex-blue transition-colors"
            />
          </div>

          {/* Type Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            {sponsorTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${selectedType === type.id
                  ? 'bg-vortex-blue text-black'
                  : 'glass-card text-white/80 hover:text-vortex-blue'
                  }`}
              >
                {type.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Sponsors Grid */}
        {loading ? (
          <div className="text-center text-white/50">Loading sponsors...</div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredSponsors.map((sponsor) => (
              <motion.div
                key={sponsor._id}
                variants={itemVariants}
                className="glass-card overflow-hidden hover:bg-white/10 transition-all duration-300 group cursor-pointer"
              >
                {/* Logo Section */}
                <div className="h-48 flex items-center justify-center bg-gradient-to-br from-gray-900/40 to-gray-800/40 p-6">
                  {sponsor.logo ? (
                    <img 
                      src={sponsor.logo} 
                      alt={sponsor.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-6xl">
                      {getSponsorTypeIcon(sponsor.type)}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {/* Sponsor Type Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-white/10 ${getSponsorTypeColor(sponsor.type)}`}>
                      {getSponsorTypeIcon(sponsor.type)} {sponsor.type}
                    </span>
                    {sponsor.industry && (
                      <span className="text-xs text-white/50 bg-white/5 px-2 py-1 rounded">
                        {sponsor.industry}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-vortex-blue transition-colors">
                    {sponsor.name}
                  </h3>

                  {/* Description */}
                  <p className="text-white/70 text-sm mb-4 line-clamp-3">
                    {sponsor.description}
                  </p>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    {sponsor.contactPerson && (
                      <div className="flex items-center text-xs text-white/50">
                        <Building className="h-4 w-4 mr-2" />
                        {sponsor.contactPerson}
                      </div>
                    )}
                    {sponsor.contactEmail && (
                      <div className="flex items-center text-xs text-white/50">
                        <Mail className="h-4 w-4 mr-2" />
                        {sponsor.contactEmail}
                      </div>
                    )}
                    {sponsor.phone && (
                      <div className="flex items-center text-xs text-white/50">
                        <Phone className="h-4 w-4 mr-2" />
                        {sponsor.phone}
                      </div>
                    )}
                  </div>

                  {/* Partnership Duration */}
                  {sponsor.startDate && (
                    <div className="flex items-center text-xs text-white/40 mb-4">
                      <Calendar className="h-4 w-4 mr-2" />
                      Partner since {new Date(sponsor.startDate).getFullYear()}
                    </div>
                  )}

                  {/* Website Link */}
                  {sponsor.website && (
                    <a
                      href={sponsor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-vortex-blue hover:text-vortex-orange transition-colors text-sm font-medium"
                    >
                      Visit Website
                      <ExternalLink className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No Results */}
        {!loading && filteredSponsors.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-white/60 text-lg">
              No sponsors found matching your criteria.
            </p>
          </motion.div>
        )}

        {/* Partnership CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
              Interested in Partnering with Us?
            </h2>
            <p className="text-white/70 mb-6">
              Join our community of sponsors and help us drive innovation in technology. 
              Let's create something amazing together.
            </p>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=teamvortexnce@gmail.com&su=Sponsorship%20Inquiry%20-%20Team%20Vortex&body=Hello%20Team%20Vortex,%0D%0A%0D%0AI%20am%20interested%20in%20partnering%20with%20your%20organization.%0D%0A%0D%0A"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-button bg-vortex-blue text-black font-bold px-8 py-3 hover:bg-vortex-blue/90 transition-colors inline-flex items-center gap-2 rounded-lg"
            >
              <Mail className="h-5 w-5" />
              Get in Touch
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Sponsors;