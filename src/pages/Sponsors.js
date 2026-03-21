import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, ExternalLink, Mail, Phone, Building, Calendar, Instagram } from 'lucide-react';
import API_BASE_URL from '../apiConfig';
import SmartImage from '../components/SmartImage';

const Sponsors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use AbortController for cleanup
    const controller = new AbortController();
    
    fetch(`${API_BASE_URL}/api/sponsors/active`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        setSponsors(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Error fetching sponsors:', err);
          setSponsors([]);
          setLoading(false);
        }
      });
    
    return () => controller.abort();
  }, []);

  const sponsorTypes = useMemo(() => [
    { id: 'all', name: 'All Sponsors', color: 'text-white' },
    { id: 'title', name: 'Title Sponsor', color: 'text-yellow-400' },
    { id: 'platinum', name: 'Platinum', color: 'text-gray-300' },
    { id: 'gold', name: 'Gold', color: 'text-yellow-500' },
    { id: 'silver', name: 'Silver', color: 'text-gray-400' },
    { id: 'bronze', name: 'Bronze', color: 'text-orange-600' },
    { id: 'media', name: 'Media Partners', color: 'text-purple-400' },
  ], []);

  const filteredSponsors = useMemo(() => {
    if (!Array.isArray(sponsors)) return [];
    
    return sponsors.filter(sponsor => {
      const matchesSearch = searchTerm === '' || 
        sponsor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sponsor.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sponsor.industry?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || sponsor.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [sponsors, searchTerm, selectedType]);

  const getSponsorTypeColor = useCallback((type) => {
    const typeObj = sponsorTypes.find(t => t.id === type);
    return typeObj ? typeObj.color : 'text-white';
  }, [sponsorTypes]);

  const getSponsorTypeIcon = useCallback((type) => {
    switch (type) {
      case 'title': return '👑';
      case 'platinum': return '💎';
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      case 'bronze': return '🥉';
      case 'media': return '📺';
      default: return '🏢';
    }
  }, []);

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05, // Reduced from 0.1 for faster animation
      },
    },
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3, // Reduced from 0.5 for faster animation
      },
    },
  }), []);

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
          <div className="mb-6 max-w-md mx-auto">
            <div className="flex items-center gap-2 px-3 h-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg focus-within:border-vortex-blue transition-colors">
              <Search className="h-4 w-4 text-white/40 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search sponsors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 h-full bg-transparent text-white text-sm placeholder-white/40 focus:outline-none"
              />
            </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card overflow-hidden animate-pulse">
                <div className="h-32 sm:h-40 bg-white/10"></div>
                <div className="p-4 sm:p-6 space-y-3">
                  <div className="h-4 bg-white/10 rounded w-1/3"></div>
                  <div className="h-5 bg-white/10 rounded w-2/3"></div>
                  <div className="h-12 bg-white/10 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
          >
            {filteredSponsors.map((sponsor) => (
              <motion.div
                key={sponsor._id}
                variants={itemVariants}
                className="glass-card overflow-hidden hover:bg-white/10 transition-all duration-300 group cursor-pointer"
              >
                {/* Logo Section */}
                <div className="h-32 sm:h-40 flex items-center justify-center bg-gradient-to-br from-gray-900/40 to-gray-800/40 p-4 sm:p-6">
                  {sponsor.logo ? (
                    <SmartImage
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className="max-h-full max-w-full object-contain"
                      fallbackClassName="w-full h-full"
                    />
                  ) : (
                    <div className="text-4xl sm:text-6xl">
                      {getSponsorTypeIcon(sponsor.type)}
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-6">
                  {/* Sponsor Type Badge */}
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <span className={`inline-flex items-center px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full bg-white/10 ${getSponsorTypeColor(sponsor.type)}`}>
                      {getSponsorTypeIcon(sponsor.type)} {sponsor.type}
                    </span>
                    {sponsor.industry && (
                      <span className="text-[10px] sm:text-xs text-white/50 bg-white/5 px-2 py-1 rounded truncate max-w-[100px]">
                        {sponsor.industry}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="text-base sm:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:text-vortex-blue transition-colors line-clamp-1">
                    {sponsor.name}
                  </h3>

                  {/* Description */}
                  <p className="text-white/70 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
                    {sponsor.description}
                  </p>

                  {/* Contact Info */}
                  <div className="space-y-1.5 mb-3 sm:mb-4">
                    {sponsor.contactPerson && (
                      <div className="flex items-center text-xs text-white/50">
                        <Building className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                        <span className="truncate">{sponsor.contactPerson}</span>
                      </div>
                    )}
                    {sponsor.contactEmail && (
                      <div className="flex items-center text-xs text-white/50">
                        <Mail className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                        <span className="truncate">{sponsor.contactEmail}</span>
                      </div>
                    )}
                    {sponsor.phone && (
                      <div className="flex items-center text-xs text-white/50">
                        <Phone className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                        {sponsor.phone}
                      </div>
                    )}
                  </div>

                  {/* Partnership Duration */}
                  {sponsor.startDate && (
                    <div className="flex items-center text-xs text-white/40 mb-3 sm:mb-4">
                      <Calendar className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                      Partner since {new Date(sponsor.startDate).getFullYear()}
                    </div>
                  )}

                  {/* Website Link */}
                  {sponsor.website && (
                    <a
                      href={sponsor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-vortex-blue hover:text-vortex-orange transition-colors text-xs sm:text-sm font-medium py-1 touch-manipulation"
                    >
                      Visit Website
                      <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1" />
                    </a>
                  )}
                  {/* Instagram Link */}
                  {sponsor.socialLinks?.instagram && (
                    <a
                      href={sponsor.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium py-1 touch-manipulation ml-4 transition-opacity hover:opacity-80"
                    >
                      <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-md flex-shrink-0"
                        style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}>
                        <Instagram className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
                      </span>
                      <span style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Instagram
                      </span>
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