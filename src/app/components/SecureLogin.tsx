'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  InputValidator, 
  DataSanitizer 
} from '../utils/security';
import { useSecureForm, useRateLimit } from '../utils/securityMiddleware';

const SecureLogin: React.FC = () => {
  const { login, loginWithGoogle } = useAuth();
    const { user} = useAuth();

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const { errors, isSubmitting, setIsSubmitting, validateField, clearErrors } = useSecureForm();
  const { blocked, attemptsLeft, checkRateLimit } = useRateLimit('login', 3);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [securityAlert, setSecurityAlert] = useState('');

  const handleInputChange = (name: string, value: string) => {
    const sanitizedValue = DataSanitizer.sanitizeText(value);
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));

    if (name === 'email') validateField(name, sanitizedValue, { required: true, email: true });
    else if (name === 'password') validateField(name, sanitizedValue, { required: true, minLength: 6 });
  };

  const validateForm = (): boolean => {
    let isValid = true;

    if (!InputValidator.isValidEmail(formData.email)) {
      validateField('email', formData.email, { required: true, email: true });
      isValid = false;
    }

    if (formData.password.length < 6) {
      validateField('password', formData.password, { required: true, minLength: 6 });
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (blocked) {
      setSecurityAlert('Demasiados intentos fallidos. Intenta nuevamente en unos minutos.');
      return;
    }

    if (!checkRateLimit()) {
      setSecurityAlert(`Intentos restantes: ${attemptsLeft}. Ten cuidado.`);
      return;
    }

    if (!validateForm()) {
      setSecurityAlert('Por favor corrige los errores en el formulario.');
      return;
    }

    setIsSubmitting(true);
    setSecurityAlert('');

    try {
      await login(formData.email, formData.password);
      clearErrors();
      const redirect = sessionStorage.getItem('redirectAfterLogin') || '/';
      router.push(redirect);
      sessionStorage.removeItem('redirectAfterLogin');
  
    } catch (error: any) {
      let errorMessage = 'Error al iniciar sesión. Verifica tus credenciales.';
      switch (error.code) {
        case 'auth/email-not-verified':
          errorMessage = 'Debes verificar tu correo antes de iniciar sesión.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No existe una cuenta con este email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Contraseña incorrecta.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos fallidos. Intenta más tarde.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Esta cuenta ha sido deshabilitada.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'El formato del email no es válido.';
          break;
      }
      setSecurityAlert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (blocked || !checkRateLimit()) {
      setSecurityAlert('Demasiados intentos. Espera unos minutos.');
      return;
    }

    try {
      await loginWithGoogle();
      router.push(redirectTo); // <-- redirige al blog o página deseada
    } catch (error: any) {
      setSecurityAlert('Error al iniciar sesión con Google. Intenta nuevamente.');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body">
              <div className="text-center mb-4">
                <i className="bi bi-person-circle text-primary fs-1"></i>
                <h3 className="mt-2">Iniciar Sesión</h3>
                <p className="text-muted">Bienvenido de vuelta</p>
              </div>

              {securityAlert && (
                <div className="alert alert-warning d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{securityAlert}</div>
                </div>
              )}

              {attemptsLeft < 3 && !blocked && (
                <div className="alert alert-info" role="alert">
                  <small>
                    <i className="bi bi-info-circle me-1"></i>
                    Intentos restantes: {attemptsLeft}
                  </small>
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="tu@email.com"
                      maxLength={100}
                      autoComplete="email"
                      disabled={blocked}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Contraseña <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-lock"></i></span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      id="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="••••••••"
                      maxLength={128}
                      autoComplete="current-password"
                      disabled={blocked}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-cosmetic-primary"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={blocked}
                    >
                      <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                    </button>
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>
                </div>

                <button
                onClick={handleLogin}
                  type="submit"
                  className="btn btn-primary w-100 mb-3"
                  disabled={isSubmitting || blocked || Object.keys(errors).length > 0}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Verificando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Iniciar Sesión
                    </>
                  )}
                </button>

                <div className="text-center mb-3">
                  <small className="text-muted">o continúa con</small>
                </div>

                <button
                  type="button"
                  className="btn btn-outline-danger w-100 btn-profile"
                  onClick={handleGoogleLogin}
                  disabled={blocked}
                >
                  <i className="bi bi-google me-2"></i>
                  Google
                </button>
              </form>

              <div className="mt-4 text-center">
                <small className="text-muted d-flex align-items-center justify-content-center">
                  <i className="bi bi-shield-check text-success me-1"></i>
                  Conexión segura SSL
                </small>
              </div>

              <div className="text-center mt-3">
                <small>
                  ¿No tienes cuenta?{' '}
                  <Link href="/auth/register" className="text-primary text-decoration-none fw-bold">
                    Regístrate aquí
                  </Link>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecureLogin;
