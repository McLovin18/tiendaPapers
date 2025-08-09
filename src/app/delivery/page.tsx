'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DeliveryPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir automáticamente a la página de órdenes de delivery
    router.replace('/delivery/orders');
  }, [router]);

  return <div>Redirigiendo...</div>;
}
