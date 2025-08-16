/**
 * 🔒 COMPONENTE LOGIN REQUIRED SEGURO
 * Implementación mejorada con indicadores de seguridad
 */

'use client';

import React from 'react';
import Link from 'next/link';

const LoginRequired = () => {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card text-center shadow border-0">
            <div className="card-body p-5">
              {/* ✅ Icono de seguridad */}
              <div className="mb-4">
                <i className="bi bi-shield-lock-fill text-warning" style={{ fontSize: '4rem' }}></i>
              </div>
              
              <h2 className="card-title mb-3 fw-bold">Acceso Restringido</h2>
              
              <p className="card-text text-muted mb-4">
                Para acceder a esta funcionalidad, es necesario que inicies sesión de forma segura 
                o crees una cuenta protegida.
              </p>

              {/* ✅ Indicadores de seguridad */}
              <div className="mb-4">
                <div className="row text-center">
                  <div className="col-4">
                    <i className="bi bi-shield-check text-success fs-5"></i>
                    <div><small className="text-muted">Seguro</small></div>
                  </div>
                  <div className="col-4">
                    <i className="bi bi-lock-fill text-primary fs-5"></i>
                    <div><small className="text-muted">Encriptado</small></div>
                  </div>
                  <div className="col-4">
                    <i className="bi bi-person-check text-info fs-5"></i>
                    <div><small className="text-muted">Verificado</small></div>
                  </div>
                </div>
              </div>
              
              {/* ✅ Botones de acción */}
              <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                <Link 
                  href="/auth/login" 
                  className="btn btn-primary px-4 py-2 text-decoration-none"
                >
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Iniciar Sesión Segura
                </Link>
                <Link 
                  href="/auth/register" 
                  className="btn btn-primary  px-4 py-2 text-decoration-none"
                >
                  <i className="bi bi-person-plus me-2"></i>
                  Crear Cuenta
                </Link>
              </div>

              {/* ✅ Mensaje de seguridad */}
              <div className="mt-4">
                <small className="text-muted d-flex align-items-center justify-content-center">
                  <i className="bi bi-info-circle me-1"></i>
                  Tu información está protegida con encriptación SSL
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRequired;