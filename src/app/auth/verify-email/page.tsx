'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendEmailVerification, auth } from '../../utils/firebase';
import { Button, Card, Alert } from 'react-bootstrap';

const VerifyEmail = () => {
  const router = useRouter();
  const [message, setMessage] = useState('');

  const handleResend = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
      setMessage('Se ha reenviado el correo de verificación.');
    }
  };

  const goToLogin = () => {
    router.push('/auth/login'); // Lleva al login para iniciar sesión después de verificar
  };

  return (
    <main className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Card className="p-4 shadow border-0 w-100" style={{ maxWidth: 400 }}>
        <h3 className="fw-bold text-center mb-3">Verifica tu correo</h3>
        <p className="text-center">
          Te hemos enviado un correo de verificación. Por favor revisa tu bandeja de entrada y confirma tu cuenta antes de continuar.
        </p>

        {message && <Alert variant="success">{message}</Alert>}

        <Button variant="dark" className="w-100 mb-3" onClick={handleResend}>
          Reenviar correo
        </Button>

        <Button variant="success" className="w-100" onClick={goToLogin}>
          Verificado, iniciar sesión
        </Button>
      </Card>
    </main>
  );
};

export default VerifyEmail;
