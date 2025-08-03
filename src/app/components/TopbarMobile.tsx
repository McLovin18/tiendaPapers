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

  // ✅ Construir menú según el rol del usuario
  let menuItems = [...baseMenuItems];

  if (isAdmin) {
    // Para admin: agregar opciones de administración
    menuItems = [
      ...baseMenuItems,
      { name: 'Admin', path: '/admin/orders', icon: 'bi-shield-check' },
      { name: 'Stats', path: '/admin/delivery-stats', icon: 'bi-graph-up-arrow' }
    ];
  } else if (isDelivery) {
    // Para delivery: agregar opción de entregas
    menuItems = [
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
      return pathname === '/admin/orders' || (pathname.startsWith('/admin') && !pathname.startsWith('/admin/delivery-stats'));
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

  return (
    <nav className="topbar-mobile d-lg-none bg-white shadow-sm border-bottom position-sticky" 
         style={{ 
           borderColor: '#e9ecef', 
           top: '76px', 
           zIndex: 1020
         }}>
      <div className="container-fluid px-2 py-2">
        <ul className="nav nav-pills d-flex justify-content-around mb-0">
          {menuItems.map((item) => (
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
                  backgroundColor: isActiveLink(item.path) ? '#e7f3ff' : 'transparent',
                  color: isActiveLink(item.path) ? '#0d6efd' : '#6c757d',
                  transition: 'all 0.2s ease'
                }}
              >
                <i 
                  className={`bi ${item.icon}`} 
                  style={{ 
                    fontSize: '1.1rem',
                    color: isActiveLink(item.path) ? '#0d6efd' : '#6c757d'
                  }}
                ></i>
                <span 
                  className="small" 
                  style={{ 
                    fontSize: '0.7rem',
                    color: isActiveLink(item.path) ? '#0d6efd' : '#6c757d'
                  }}
                >
                  {item.name}
                </span>
                
                {/* Indicador visual para el item activo */}
                {isActiveLink(item.path) && (
                  <div 
                    className="position-absolute rounded-circle bg-primary"
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
      </div>
      
      {/* Estilos CSS específicos para el componente */}
      <style jsx>{`
        .topbar-mobile .nav-link:hover {
          background-color: #f8f9fa !important;
          transform: translateY(-1px);
          color: #0d6efd !important;
        }

        .topbar-mobile .nav-link.active {
          background-color: #e7f3ff !important;
          color: #0d6efd !important;
        }

        .topbar-mobile .nav-link {
          transition: all 0.2s ease;
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
        }
      `}</style>
    </nav>
  );
};

export default TopbarMobile;
