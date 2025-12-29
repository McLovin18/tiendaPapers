'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { userNotificationService, UserNotification } from '../services/userNotificationService';

const UserNotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = userNotificationService.subscribeToUserNotifications(
      user.uid,
      (list) => {
        setNotifications(list);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter((n) => n.status === 'unread').length;

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unread = notifications.filter((n) => n.status === 'unread' && n.id);
      await Promise.all(unread.map((n) => userNotificationService.markAsRead(n.id!)));
    } catch (err) {
      console.error('Error marcando notificaciones como leídas', err);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="position-relative me-3 notification-bell-wrapper" ref={bellRef}>
      <button
        type="button"
        className="btn btn-link p-0 position-relative notification-bell-btn"
        aria-label="Notificaciones"
        onClick={handleToggle}
        style={{ textDecoration: 'none' }}
      >
        <i className="bi bi-bell" style={{ fontSize: '1.6rem', color: 'var(--cosmetic-accent)' }}></i>
        {unreadCount > 0 && (
          <span className="notification-badge position-absolute">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="notifications-dropdown shadow rounded bg-white position-absolute end-0 mt-2"
          style={{ minWidth: '280px', maxWidth: '360px', maxHeight: '380px', overflowY: 'auto', zIndex: 2000 }}
        >
          <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
            <span className="fw-semibold" style={{ fontSize: '0.95rem' }}>Notificaciones</span>
            {unreadCount > 0 && (
              <button
                type="button"
                className="btn btn-link btn-sm p-0 notification-mark-all"
                onClick={handleMarkAllAsRead}
                style={{ fontSize: '0.8rem' }}
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {notifications.length === 0 && (
            <div className="px-3 py-3 text-muted" style={{ fontSize: '0.85rem' }}>
              Aún no tienes notificaciones.
            </div>
          )}

          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="px-3 py-2 border-bottom"
              style={{
                backgroundColor: notif.status === 'unread' ? 'rgba(255, 244, 245, 0.8)' : 'transparent',
              }}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="fw-semibold" style={{ fontSize: '0.86rem' }}>
                    {notif.title}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                    {notif.message}
                  </div>
                  {notif.type === 'coupon' && notif.data?.couponCode && (
                    <div className="mt-1">
                      <span className="badge notification-coupon-badge" style={{ fontSize: '0.75rem' }}>
                        CÓDIGO: {notif.data.couponCode}
                      </span>
                    </div>
                  )}
                  {notif.type === 'orderStatus' && notif.data?.orderId && (
                    <div className="mt-1">
                      <Link
                        href={`/profile/orders/${notif.data.orderId}`}
                        className="text-decoration-underline"
                        style={{ fontSize: '0.78rem' }}
                      >
                        Ver detalle del pedido
                      </Link>
                    </div>
                  )}
                </div>
                {notif.status === 'unread' && (
                  <span
                    className="badge bg-danger rounded-circle ms-2"
                    style={{ width: '8px', height: '8px', padding: 0 }}
                  ></span>
                )}
              </div>
              <div className="text-muted mt-1" style={{ fontSize: '0.7rem' }}>
                {new Date(notif.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .notification-bell-wrapper {
          overflow: visible;
          display: inline-block;
        }

        .notifications-dropdown {
          background-color: #ffffff;
          border-radius: 1rem;
          border: 1px solid rgba(140, 156, 132, 0.18);
          box-shadow: 0 14px 35px rgba(28, 36, 22, 0.15);
        }

        .notification-bell-btn {
          border-radius: 999px;
          background: radial-gradient(circle at top left, rgba(242, 221, 204, 0.45), rgba(255, 250, 245, 0.9));
          box-shadow: 0 6px 18px rgba(199, 145, 104, 0.28);
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
          overflow: visible;
        }

        .notification-bell-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(199, 145, 104, 0.35);
        }

        .notification-badge {
          top: -6px;
          right: -6px;
          min-width: 18px;
          height: 18px;
          border-radius: 999px;
          background-color: var(--cosmetic-accent);
          color: #ffffff;
          font-size: 0.65rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 0 2px #fff;
          z-index: 30;
        }

        .notifications-dropdown .border-bottom {
          border-color: rgba(140, 156, 132, 0.18) !important;
        }

        .notifications-dropdown .fw-semibold {
          color: var(--cosmetic-tertiary);
        }

        .notification-mark-all {
          color: var(--cosmetic-accent) !important;
          background-color: transparent !important;
          border-color: transparent !important;
        }

        .notification-mark-all:hover {
          color: var(--cosmetic-primary) !important;
          text-decoration: underline;
          background-color: transparent !important;
          border-color: transparent !important;
        }

        .notification-coupon-badge {
          background-color: rgba(188, 216, 192, 0.35);
          color: #264132;
          border-radius: 999px;
          padding-inline: 0.6rem;
          letter-spacing: 0.03em;
        }

        @media (max-width: 991.98px) {
          .notification-bell-btn {
            box-shadow: 0 4px 12px rgba(199, 145, 104, 0.24);
          }

          .notification-badge {
            top: -6px;
            right: -6px;
            min-width: 18px;
            height: 18px;
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
};

export default UserNotificationBell;
