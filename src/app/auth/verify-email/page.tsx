'use client';

import React, { useEffect, useState } from 'react';
import { auth } from '../../utils/firebase';
import { sendEmailVerification, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button, Card, Alert } from 'react-bootstrap';

const VerifyEmail = () => {
  const router = useRouter();
  const [message, setMessage] = useState('');

  // Reenviar correo
  const handleResend = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
      setMessage('Se ha reenviado el correo de verificación.');
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timer;

    const checkVerification = async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload(); // 🔄 recarga usuario
        if (auth.currentUser.emailVerified) {
          clearInterval(interval);
          router.push('/tienda'); // redirige automáticamente
        }
      }
    };

    // Configura un intervalo para recargar usuario
    interval = setInterval(checkVerification, 2000); // cada 2 segundos

    // Además detecta cambios de sesión (logout/login)
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (!user) {
        router.push('/login');
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [router]);

  return (
    <main className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Card className="p-4 shadow border-0 w-100" style={{ maxWidth: 400 }}>
        <h3 className="fw-bold text-center mb-3">Verifica tu correo</h3>
        <p className="text-center">
          Te hemos enviado un correo de verificación. Por favor revisa tu bandeja de entrada y confirma tu cuenta antes de continuar.
        </p>

        {message && <Alert variant="success">{message}</Alert>}

        <Button variant="dark" className="w-100" onClick={handleResend}>
          Reenviar correo
        </Button>
      </Card>
    </main>
  );
};

export default VerifyEmail;
