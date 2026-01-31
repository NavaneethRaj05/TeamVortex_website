import React, { useState, useEffect } from 'react';
import { Mail, Phone, Linkedin, Instagram } from 'lucide-react';
import API_BASE_URL from '../apiConfig';

const Footer = () => {
  const [settings, setSettings] = useState({
    email: 'teamvortexnce@gmail.com',
    phone: '+91 78922 04388',
    linkedinUrl: '#',
    instagramUrl: 'https://www.instagram.com/vortex_nce?igsh=MXM1djkybGdwaXc5bw==',
    copyrightYear: 2026
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data) setSettings(data);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <footer className="bg-[#050505] border-t border-white/5 py-16 px-4 relative z-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          {/* Logo and Club Info */}
          <div className="mb-12">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-3xl font-display font-bold gradient-text text-glow tracking-wider">
                TEAM VORTEX
              </span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
            <div className="flex items-center space-x-3 text-white">
              <div className="w-10 h-10 rounded-lg bg-vortex-blue/10 flex items-center justify-center border border-vortex-blue/20">
                <Mail className="h-5 w-5 text-vortex-blue" />
              </div>
              <span className="font-medium">{settings.email}</span>
            </div>
            <div className="flex items-center space-x-3 text-white">
              <div className="w-10 h-10 rounded-lg bg-vortex-orange/10 flex items-center justify-center border border-vortex-orange/20">
                <Phone className="h-5 w-5 text-vortex-orange" />
              </div>
              <span className="font-medium">{settings.phone}</span>
            </div>
          </div>

          {/* Social Media Icons */}
          <div className="flex justify-center space-x-6 mb-8">
            <a
              href={settings.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 glass-card rounded-full flex items-center justify-center hover:bg-vortex-blue/20 transition-colors"
            >
              <Linkedin className="h-6 w-6 text-white hover:text-vortex-blue" />
            </a>
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 glass-card rounded-full flex items-center justify-center hover:bg-vortex-blue/20 transition-colors"
            >
              <Instagram className="h-6 w-6 text-white hover:text-vortex-blue" />
            </a>
          </div>

          {/* Copyright */}
          <div className="text-white/40 text-sm">
            © {settings.copyrightYear} Team Vortex. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;