'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { FileTextIcon, DollarSignIcon } from 'lucide-react';
import { LicenseIcon } from './icons/LicenseIcon';
import { useEffect, useState } from 'react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const [screenSize, setScreenSize] = useState<'mobile' | 'desktop'>('desktop');

  useEffect(() => {
    // Set initial screen size
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleResize = () => {
    if (window.innerWidth < 768) {
      setScreenSize('mobile');
    } else {
      setScreenSize('desktop');
    }
  };

  const tabs = [
    {
      id: 'license',
      name: 'License Management',
      icon: <LicenseIcon size={18} />,
    },
    {
      id: 'register',
      name: 'IP Registration',
      icon: <FileTextIcon size={18} />,
    },
    {
      id: 'royalty',
      name: 'Royalty Management',
      icon: <DollarSignIcon size={18} />,
    },
    {
      id: 'remix',
      name: 'Remix Management',
      icon: <FileTextIcon size={18} />,
    },
  ];

  // Handle tab click with mobile menu auto-close
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (screenSize === 'mobile') {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className="container mx-auto px-4 relative">
      {/* Desktop Navigation */}
      <div className="hidden md:flex overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {tab.icon}
            {tab.name}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab-desktop"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                initial={false}
              />
            )}
          </button>
        ))}
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 rounded-md z-50"
        >
          <div className="flex flex-col py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700/50'
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </nav>
  );
};
