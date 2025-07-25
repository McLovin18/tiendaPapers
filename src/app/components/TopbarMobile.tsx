'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';

const TopbarMobile = () => {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const menuItems = [
    { name: 'Inicio', path: '/', icon: 'bi-house-door' },
    { name: 'Productos', path: '/products', icon: 'bi-bag' },
    { name: 'Mis compras', path: '/myOrders', icon: 'bi-bag-check' },
    { name: 'Favoritos', path: '/favourite', icon: 'bi-heart' },
  ];

  return (
    <nav className="topbar-mobile d-lg-none bg-light shadow-sm border-bottom position-sticky" 
         style={{ 
           borderColor: '#ececec', 
           top: '76px', 
           zIndex: 99 
         }}>
      <div className="container-fluid px-3 py-2">
        <ul className="nav nav-pills d-flex justify-content-around mb-0">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link 
                href={item.path} 
                className={`nav-link d-flex flex-column align-items-center gap-1 px-2 py-2 ${
                  pathname === item.path || (item.path.startsWith('/profile') && pathname.startsWith('/profile')) 
                    ? 'active' 
                    : 'text-dark'
                }`}
                style={{ borderRadius: '0.5rem', fontWeight: 500, minWidth: '60px' }}
              >
                <i className={`bi ${item.icon} fs-5`}></i>
                <span className="small">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default TopbarMobile;
