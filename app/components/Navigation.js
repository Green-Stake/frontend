'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path) => {
    return pathname === path ? 'text-primary-600 font-semibold' : 'text-gray-600 hover:text-primary-600';
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary-600">
                GreenStake
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/projects"
                className={`${isActive('/projects')} inline-flex items-center px-1 pt-1 text-sm`}
              >
                {mounted ? 'Browse Projects' : 'Projects'}
              </Link>
              {mounted && (
                <Link
                  href="/list"
                  className={`${isActive('/list')} inline-flex items-center px-1 pt-1 text-sm`}
                >
                  List Project
                </Link>
              )}
              <Link
                href="/dao"
                className={`${isActive('/dao')} inline-flex items-center px-1 pt-1 text-sm`}
              >
                DAO
              </Link>
              <Link
                href="/profile"
                className={`${isActive('/profile')} inline-flex items-center px-1 pt-1 text-sm`}
              >
                Profile
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <ConnectButton />
          </div>
        </div>
      </nav>
    </header>
  );
}
