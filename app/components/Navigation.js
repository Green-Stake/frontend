'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path) =>
    pathname === path
      ? 'text-green-400 border-b-2 border-green-400'
      : 'text-gray-400 hover:text-white hover:border-b-2 hover:border-green-400 transition-all';

  return (
    <header className="bg-black/80 backdrop-blur sticky top-0 z-50 border-b border-green-900 shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="text-2xl font-bold text-white">
              Green<span className="text-green-700">Stake</span>
            </Link>
          </div>

          {/* Hamburger Icon for mobile */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Nav links for desktop */}
          <div className="hidden sm:flex space-x-6 items-center text-sm font-medium">
            <Link href="/projects" className={`px-1 ${isActive('/projects')}`}>
              {mounted ? 'Browse Projects' : 'Projects'}
            </Link>
            {mounted && (
              <Link href="/list" className={`px-1 ${isActive('/list')}`}>
                List Project
              </Link>
            )}
            <Link href="/dao" className={`px-1 ${isActive('/dao')}`}>
              DAO
            </Link>
            <Link href="/profile" className={`px-1 ${isActive('/profile')}`}>
              Profile
            </Link>
          </div>

          {/* Connect Wallet */}
          <div className="ml-4 hidden sm:block">
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="sm:hidden bg-black/80 backdrop-blur py-4 space-y-4">
          <Link href="/projects" className={`block px-4 py-2 text-lg ${isActive('/projects')}`}>
            Projects
          </Link>
          {mounted && (
            <Link href="/list" className={`block px-4 py-2 text-lg ${isActive('/list')}`}>
              List Project
            </Link>
          )}
          <Link href="/dao" className={`block px-4 py-2 text-lg ${isActive('/dao')}`}>
            DAO
          </Link>
          <Link href="/profile" className={`block px-4 py-2 text-lg ${isActive('/profile')}`}>
            Profile
          </Link>
          <div className="px-4 py-2">
            <ConnectButton />
          </div>
        </div>
      )}
    </header>
  );
}
