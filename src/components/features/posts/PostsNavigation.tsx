'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavigationItemProps = {
  href: string;
  label: string;
  isActive: boolean;
};

const NavigationItem = ({ href, label, isActive }: NavigationItemProps) => {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-md transition-colors ${
        isActive 
          ? 'bg-red-600 text-white font-medium' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
    </Link>
  );
};

export default function PostsNavigation() {
  const pathname = usePathname();

  const navigationItems = [
    { href: '/admin/links/posts/create', label: 'Crear' },
    { href: '/admin/links/posts/categories', label: 'Categorías' },
    { href: '/admin/links/posts', label: 'Publicaciones' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm mb-6 p-2 flex items-center space-x-2">
      {navigationItems.map((item) => (
        <NavigationItem
          key={item.href}
          href={item.href}
          label={item.label}
          isActive={pathname === item.href}
        />
      ))}
    </div>
  );
}
