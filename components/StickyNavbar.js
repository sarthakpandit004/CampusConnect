// components/FeatureNavBar.js
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { name: 'SkillSwap', href: '/amity/skills' },
  { name: 'CampusCrate', href: '/amity/marketplace' },
  { name: 'Community Chat', href: '/amity/community' },
];

export default function StickyNavbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-6">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium px-3 py-1.5 rounded-md transition ${
                isActive
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-black'
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
