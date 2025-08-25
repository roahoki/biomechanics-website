'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type SubNavItem = {
  label: string;
  href: string;
};

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  subItems?: SubNavItem[];
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSubMenuOpen, setMobileSubMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    // Establecer el estado inicial para saber si el menú de Links debe estar expandido
    const isInLinksSection = pathname.startsWith('/admin/links/');
    if (isInLinksSection) {
      setExpandedItems(prev => ({ ...prev, 'links': true }));
    }
    
    // Verificar si es móvil
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, [pathname]);
  
  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const navItems: NavItem[] = [
    {
      label: 'Inicio',
      href: '/admin',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
          <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
        </svg>
      ),
    },
    {
      label: 'Links',
      href: '/admin/links',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M19.902 4.098a3.75 3.75 0 00-5.304 0l-4.5 4.5a3.75 3.75 0 001.035 6.037.75.75 0 01-.646 1.353 5.25 5.25 0 01-1.449-8.45l4.5-4.5a5.25 5.25 0 117.424 7.424l-1.757 1.757a.75.75 0 11-1.06-1.06l1.757-1.757a3.75 3.75 0 000-5.304zm-7.389 4.267a.75.75 0 011-.353 5.25 5.25 0 011.449 8.45l-4.5 4.5a5.25 5.25 0 11-7.424-7.424l1.757-1.757a.75.75 0 111.06 1.06l-1.757 1.757a3.75 3.75 0 105.304 5.304l4.5-4.5a3.75 3.75 0 00-1.035-6.037.75.75 0 01-.354-1z" clipRule="evenodd" />
        </svg>
      ),
      subItems: [
        {
          label: 'Perfil',
          href: '/admin/links/profile',
        },
        {
          label: 'Diseño',
          href: '/admin/links/design',
        },
        {
          label: 'Publicaciones',
          href: '/admin/links/posts',
        }
      ]
    },
    {
      label: 'Configuración',
      href: '/admin/settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.986.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Versión para desktop - Barra lateral */}
      <div className="hidden md:flex flex-col w-[72px] hover:w-64 transition-all duration-300 ease-in-out overflow-hidden fixed left-0 top-16 bottom-0 bg-white shadow-lg z-10">
        <nav className="flex flex-col py-4 h-full overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isExpanded = expandedItems[item.href.split('/').pop() || ''] || false;
            
            return (
              <div key={item.href} className="flex flex-col">
                <div className="flex items-center">
                  {hasSubItems ? (
                    <button
                      onClick={() => toggleExpand(item.href.split('/').pop() || '')}
                      className={`flex items-center w-full px-4 py-3 gap-4 hover:bg-gray-100 transition-colors duration-200 ${
                        isActive ? 'font-medium text-red-600' : 'text-gray-700'
                      }`}
                    >
                      <div className={isActive ? 'text-red-600' : 'text-gray-700'}>
                        {item.icon}
                      </div>
                      <span className="truncate flex-grow">{item.label}</span>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="currentColor" 
                        className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      >
                        <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" />
                      </svg>
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center w-full px-4 py-3 gap-4 hover:bg-gray-100 transition-colors duration-200 ${
                        isActive ? 'font-medium text-red-600' : 'text-gray-700'
                      }`}
                    >
                      <div className={isActive ? 'text-red-600' : 'text-gray-700'}>
                        {item.icon}
                      </div>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  )}
                </div>
                
                {hasSubItems && isExpanded && (
                  <div className="ml-12 border-l border-gray-200 pl-4 py-1">
                    {item.subItems?.map((subItem) => {
                      const isSubActive = pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`block py-2 hover:text-red-600 transition-colors duration-200 ${
                            isSubActive ? 'text-red-600 font-medium' : 'text-gray-600'
                          }`}
                        >
                          {subItem.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Versión para móvil - Barra inferior */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <nav className="flex justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const hasSubItems = item.subItems && item.subItems.length > 0;
            
            return (
              <div key={item.href} className="relative">
                {hasSubItems ? (
                  <button
                    onClick={() => setMobileSubMenuOpen(mobileSubMenuOpen === item.href ? null : item.href)}
                    className={`flex flex-col items-center py-2 px-1 ${
                      isActive ? 'text-red-600' : 'text-gray-700'
                    }`}
                  >
                    <div>{item.icon}</div>
                    <span className="text-xs mt-1">{item.label}</span>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex flex-col items-center py-2 px-1 ${
                      isActive ? 'text-red-600' : 'text-gray-700'
                    }`}
                  >
                    <div>{item.icon}</div>
                    <span className="text-xs mt-1">{item.label}</span>
                  </Link>
                )}
                
                {/* Submenú móvil */}
                {hasSubItems && mobileSubMenuOpen === item.href && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white rounded-md shadow-lg border border-gray-200 w-40 z-20">
                    {item.subItems?.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className="block px-4 py-3 text-sm hover:bg-gray-100 text-gray-700"
                        onClick={() => setMobileSubMenuOpen(null)}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
      
      {/* Espacio para la barra lateral en desktop y para la barra inferior en móvil */}
      <div className="hidden md:block w-[72px]"></div>
      <div className="md:hidden h-16"></div>
    </>
  );
}
