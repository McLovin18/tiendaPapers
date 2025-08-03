'use client';

import React, { useEffect } from 'react';
import { Alert, Badge, Button, Spinner } from 'react-bootstrap';
import { useStockValidation } from '../hooks/useStockValidation';

interface StockValidationProps {
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  onStockValidated?: (isValid: boolean, errors: string[]) => void;
  className?: string;
}

export default function StockValidation({ items, onStockValidated, className = '' }: StockValidationProps) {
  const { stockInfo, loading, lastCheck, isValid, errors, validateStock } = useStockValidation({ items });

  // Notificar cambios de validación al componente padre
  useEffect(() => {
    onStockValidated?.(isValid, errors);
  }, [isValid, errors, onStockValidated]);

  const hasStockIssues = !isValid;
  const hasLowStock = stockInfo.some(info => info.isValid && info.available <= 5);

  if (items.length === 0) return null;

  return (
    <div className={className}>
      {/* Botón de verificación manual */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <small className="text-muted">
          {lastCheck && `Última verificación: ${lastCheck.toLocaleTimeString()}`}
        </small>
        <Button 
          variant="outline-primary" 
          size="sm" 
          onClick={validateStock}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-1" />
              Verificando...
            </>
          ) : (
            <>
              <i className="bi bi-arrow-clockwise me-1"></i>
              Verificar Stock
            </>
          )}
        </Button>
      </div>

      {/* Alertas de stock */}
      {hasStockIssues && (
        <Alert variant="danger" className="mb-2">
          <div className="d-flex align-items-center mb-2">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>Problemas de Stock Detectados</strong>
          </div>
          <small>Los siguientes productos tienen problemas de disponibilidad:</small>
          <ul className="mb-0 mt-2 small">
            {stockInfo
              .filter(info => !info.isValid)
              .map(info => (
                <li key={info.productId}>
                  <strong>{info.name}</strong>: Disponible {info.available}, solicitado {info.requested}
                </li>
              ))
            }
          </ul>
        </Alert>
      )}

      {hasLowStock && !hasStockIssues && (
        <Alert variant="warning" className="mb-2">
          <div className="d-flex align-items-center mb-2">
            <i className="bi bi-exclamation-circle-fill me-2"></i>
            <strong>Stock Limitado</strong>
          </div>
          <small>Algunos productos tienen pocas unidades disponibles:</small>
          <ul className="mb-0 mt-2 small">
            {stockInfo
              .filter(info => info.isValid && info.available <= 5)
              .map(info => (
                <li key={info.productId}>
                  <strong>{info.name}</strong>: Solo quedan {info.available} unidades
                </li>
              ))
            }
          </ul>
        </Alert>
      )}

      {!hasStockIssues && !hasLowStock && stockInfo.length > 0 && (
        <Alert variant="success" className="mb-2">
          <div className="d-flex align-items-center">
            <i className="bi bi-check-circle-fill me-2"></i>
            <small><strong>Stock Verificado</strong> - Todos los productos están disponibles</small>
          </div>
        </Alert>
      )}

      {/* Resumen rápido */}
      {stockInfo.length > 0 && (
        <div className="d-flex gap-2 flex-wrap">
          {stockInfo.map(info => (
            <Badge 
              key={info.productId}
              bg={info.isValid ? (info.available <= 5 ? 'warning' : 'success') : 'danger'}
              text={info.available <= 5 && info.isValid ? 'dark' : 'white'}
              className="small"
            >
              {info.name}: {info.available} disponibles
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
