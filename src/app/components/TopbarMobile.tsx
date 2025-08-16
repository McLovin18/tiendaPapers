'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/adminContext';
import { usePathname } from 'next/navigation';

const TopbarMobile = () => {
  const { user } = useAuth();
  const { isAdmin, isDelivery } = useRole();
  const pathname = usePathname();

  if (!user) return null;

  // ✅ Menú base para todos los usuarios
  const baseMenuItems = [
    { name: 'Inicio', path: '/', icon: 'bi-house-door' },
    { name: 'Productos', path: '/products', icon: 'bi-bag' },
    { name: 'Mis compras', path: '/myOrders', icon: 'bi-bag-check' },
    { name: 'Favoritos', path: '/favourite', icon: 'bi-heart' },
  ];

  // ✅ Menú de administración - fila principal
  const adminMainItems = [
    { name: 'Admin', path: '/admin/orders', icon: 'bi-shield-check' }
  ];

  // ✅ Menú de administración - fila secundaria (herramientas avanzadas)
  const adminAdvancedItems = [
    { name: 'Inventario', path: '/admin/inventory', icon: 'bi-boxes' },
    { name: 'Migración', path: '/admin/migration', icon: 'bi-database-fill-gear' },
    { name: 'Estadísticas', path: '/admin/delivery-stats', icon: 'bi-graph-up-arrow' }
  ];

  // ✅ Construir menús según el rol del usuario
  let mainMenuItems = [...baseMenuItems];
  let secondaryMenuItems: typeof baseMenuItems = [];

  if (isAdmin) {
    // Para admin: fila principal con menú base + admin principal
    mainMenuItems = [...baseMenuItems, ...adminMainItems];
    // Fila secundaria con herramientas avanzadas
    secondaryMenuItems = adminAdvancedItems;
  } else if (isDelivery) {
    // Para delivery: solo una fila
    mainMenuItems = [
      ...baseMenuItems,
      { name: 'Entregas', path: '/delivery/orders', icon: 'bi-truck' }
    ];
  }

  // Función para determinar si un link está activo
  const isActiveLink = (itemPath: string) => {
    if (itemPath === '/') {
      return pathname === '/';
    }
    
    // Lógica específica para rutas de admin
    if (itemPath === '/admin/orders') {
      return pathname === '/admin/orders';
    }
    
    if (itemPath === '/admin/inventory') {
      return pathname === '/admin/inventory';
    }
    
    if (itemPath === '/admin/migration') {
      return pathname === '/admin/migration';
    }
    
    if (itemPath === '/admin/delivery-stats') {
      return pathname === '/admin/delivery-stats' || pathname.startsWith('/admin/delivery-stats');
    }
    
    // Lógica específica para rutas de delivery
    if (itemPath === '/delivery/orders') {
      return pathname.startsWith('/delivery');
    }
    
    // Para otras rutas, verificación normal
    return pathname.startsWith(itemPath);
  };

  // Componente para renderizar una fila de navegación
  const renderNavRow = (items: typeof baseMenuItems, className = '') => (
    <ul className={`nav nav-pills d-flex justify-content-around mb-0 ${className}`}>
      {items.map((item) => (
        <li key={item.path} className="nav-item flex-fill">
          <Link 
            href={item.path} 
            className={`nav-link d-flex flex-column align-items-center gap-1 p-2 text-center ${
              isActiveLink(item.path) ? 'active' : 'text-dark'
            }`}
            style={{ 
              borderRadius: '0.75rem', 
              fontWeight: isActiveLink(item.path) ? 600 : 500,
              fontSize: '0.75rem',
              minHeight: '60px',
              backgroundColor: isActiveLink(item.path) ? 'var(--cosmetic-primary)' : 'transparent',
              color: isActiveLink(item.path) ? 'white' : 'var(--cosmetic-tertiary)',
              transition: 'all 0.2s ease'
            }}
          >
            <i 
              className={`bi ${item.icon}`} 
              style={{ 
                fontSize: '1.1rem',
                color: isActiveLink(item.path) ? 'white' : 'var(--cosmetic-tertiary)'
              }}
            ></i>
            <span 
              className="small" 
              style={{ 
                fontSize: '0.7rem',
                color: isActiveLink(item.path) ? 'white' : 'var(--cosmetic-tertiary)'
              }}
            >
              {item.name}
            </span>
            
            {/* Indicador visual para el item activo */}
            {isActiveLink(item.path) && (
              <div 
                className="position-absolute rounded-circle bg-white"
                style={{
                  width: '4px',
                  height: '4px',
                  bottom: '4px',
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}
              />
            )}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <nav className="topbar-mobile d-lg-none bg-white shadow-sm border-bottom position-sticky" 
         style={{ 
           borderColor: 'var(--cosmetic-primary)', 
           top: '76px', 
           zIndex: 1020
         }}>
      <div className="container-fluid px-2 py-2">
        {/* Fila principal de navegación */}
        {renderNavRow(mainMenuItems)}
        
        {/* Fila secundaria solo para administradores */}
        {isAdmin && secondaryMenuItems.length > 0 && (
          <div className="mt-2 pt-2 border-top" style={{ borderColor: 'var(--cosmetic-primary)' }}>
            {renderNavRow(secondaryMenuItems, 'admin-secondary')}
          </div>
        )}
      </div>
      
      {/* Estilos CSS específicos para el componente */}
      <style jsx>{`
        .topbar-mobile .nav-link:hover {
          background-color: var(--cosmetic-secondary) !important;
          transform: translateY(-1px);
          color: var(--cosmetic-primary) !important;
        }

        .topbar-mobile .nav-link.active {
          background-color: var(--cosmetic-primary) !important;
          color: white !important;
        }

        .topbar-mobile .nav-link {
          transition: all 0.2s ease;
        }

        .topbar-mobile .admin-secondary .nav-link {
          min-height: 55px;
          font-size: 0.7rem;
        }

        .topbar-mobile .admin-secondary .nav-link i {
          font-size: 1rem;
        }

        .topbar-mobile .admin-secondary .nav-link span {
          font-size: 0.65rem;
        }

        /* Responsive para pantallas muy pequeñas */
        @media (max-width: 576px) {
          .topbar-mobile .nav-link {
            padding: 0.4rem 0.2rem !important;
            font-size: 0.65rem !important;
            min-height: 55px;
          }
          
          .topbar-mobile .nav-link i {
            font-size: 1rem !important;
          }
          
          .topbar-mobile .nav-link span {
            font-size: 0.6rem !important;
          }

          .topbar-mobile .admin-secondary .nav-link {
            min-height: 50px;
            padding: 0.3rem 0.1rem !important;
          }

          .topbar-mobile .admin-secondary .nav-link i {
            font-size: 0.9rem !important;
          }

          .topbar-mobile .admin-secondary .nav-link span {
            font-size: 0.55rem !important;
          }
        }

        /* Para pantallas medianas */
        @media (min-width: 577px) and (max-width: 991px) {
          .topbar-mobile .nav-link {
            padding: 0.5rem !important;
            min-height: 65px;
          }
          
          .topbar-mobile .nav-link i {
            font-size: 1.2rem !important;
          }

          .topbar-mobile .admin-secondary .nav-link {
            min-height: 60px;
          }
        }
      `}</style>
    </nav>
  );
};

export default TopbarMobile;
