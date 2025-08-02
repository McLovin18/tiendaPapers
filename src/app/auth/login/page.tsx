'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, complete todos los campos');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      router.push('/');
    } catch (error: any) {
      console.error('Error de login:', error);
      let errorMessage = '';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuario no encontrado';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Contraseña incorrecta';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Usuario deshabilitado';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos. Intenta más tarde';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Error de conexión. Verifica tu internet';
          break;
        default:
          errorMessage = error.message || 'Error al iniciar sesión. Inténtelo de nuevo.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      router.push('/');
    } catch (error) {
      setError('Error al iniciar sesión con Google');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Card className="p-4 shadow border-0 w-100" style={{ maxWidth: 400 }}>
        <h2 className="fw-bold mb-4 text-center">Iniciar Sesión</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-1" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="rounded-1" />
          </Form.Group>
          {error && <Alert variant="danger">{error}</Alert>}
          <Button type="submit" variant="dark" className="w-100 rounded-1 mb-3" disabled={loading}>
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </Button>
          <Button type="button" variant="outline-dark" className="w-100 rounded-1 mb-3" onClick={handleGoogleLogin} disabled={loading}>
            <i className="bi bi-google me-2"></i> Iniciar con Google
          </Button>
          <div className="text-center">
            <Link href="/auth/register" className="text-dark">¿No tienes cuenta? Regístrate</Link>
          </div>
        </Form>
      </Card>
    </main>
  );
};

export default Login;