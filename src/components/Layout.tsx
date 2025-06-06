'use client';

import type React from 'react';
import { Navigation } from './Navigation';
import { WalletConnect } from './ui/WalletConnect';
import { ThemeToggle } from './ui/ThemeToggle';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MenuIcon, X } from 'lucide-react';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  // Close mobile menu when switching to desktop
  const handleMenuToggle = () => {
    if (!isMobile) {
      setIsMobileMenuOpen(false);
      return;
    }
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-white">
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
              <Image
                src="/logo.png"
                alt="IPX Logo"
                width={24}
                height={24}
                priority
                className="object-cover"
              />
            </div>
            <h1 className="text-lg font-bold hidden sm:block">IPX</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <WalletConnect />
            {isMobile && (
              <button
                onClick={handleMenuToggle}
                className="p-2 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X size={20} /> : <MenuIcon size={20} />}
              </button>
            )}
          </div>
        </div>
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
      </header>
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          key={activeTab} // Re-animate when tab changes
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};
