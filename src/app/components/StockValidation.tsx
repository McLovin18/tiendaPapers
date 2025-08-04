'use client';

import React, { useEffect } from 'react';
import { Alert, Badge, Button, Spinner, Row, Col } from 'react-bootstrap';
import { useStockValidation } from '../hooks/useStockValidation';

interface StockValidationProps {
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  onStockValidated?: (isValid: boolean, errors: string[]) => void;
  onQuantityAdjust?: (itemId: string, newQuantity: number) => Promise<void>;
  onItemRemove?: (itemId: string) => Promise<void>;
  className?: string;
}

export default function StockValidation({ 
  items, 
  onStockValidated, 
  onQuantityAdjust, 
  onItemRemove, 
  className = '' 
}: StockValidationProps) {
  const { stockInfo, loading, lastCheck, isValid, errors, validateStock } = useStockValidation({ items });

  // Notificar cambios de validación al componente padre
  useEffect(() => {
    onStockValidated?.(isValid, errors);
  }, [isValid, errors, onStockValidated]);

  const hasStockIssues = !isValid;
  const hasLowStock = stockInfo.some(info => info.isValid && info.available <= 5);

  // Función para ajustar cantidad a la disponible
  const handleAdjustToAvailable = async (itemId: string, available: number) => {
    if (onQuantityAdjust && available > 0) {
      await onQuantityAdjust(itemId, available);
      // Re-validar stock después del ajuste
      setTimeout(() => validateStock(), 500);
    }
  };

  // Función para remover item completamente
  const handleRemoveItem = async (itemId: string) => {
    if (onItemRemove) {
      await onItemRemove(itemId);
      // Re-validar stock después de remover
      setTimeout(() => validateStock(), 500);
    }
  };

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

      {/* Alertas de stock con opciones de ajuste */}
      {hasStockIssues && (
        <Alert variant="danger" className="mb-2">
          <div className="d-flex align-items-center mb-3">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>Problemas de Stock Detectados</strong>
          </div>
          <small className="mb-3 d-block">Los siguientes productos tienen problemas de disponibilidad:</small>
          
          {stockInfo
            .filter(info => !info.isValid)
            .map(info => (
              <div key={info.productId} className="border rounded p-3 mb-2 bg-light">
                <Row className="align-items-center">
                  <Col md={6}>
                    <div>
                      <strong className="text-danger">{info.name}</strong>
                      <br />
                      <small className="text-muted">
                        Disponible: <span className="fw-bold text-success">{info.available}</span> | 
                        Solicitado: <span className="fw-bold text-danger">{info.requested}</span>
                      </small>
                    </div>
                  </Col>
                  <Col md={6} className="text-end">
                    <div className="d-flex gap-2 justify-content-end flex-wrap">
                      {info.available > 0 && onQuantityAdjust && (
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => handleAdjustToAvailable(info.productId.toString(), info.available)}
                        >
                          <i className="bi bi-arrow-down-circle me-1"></i>
                          Ajustar a {info.available}
                        </Button>
                      )}
                      {onItemRemove && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemoveItem(info.productId.toString())}
                        >
                          <i className="bi bi-trash me-1"></i>
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </Col>
                </Row>
                {info.available === 0 && (
                  <div className="mt-2">
                    <small className="text-danger">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      <strong>Producto agotado</strong> - No hay unidades disponibles
                    </small>
                  </div>
                )}
              </div>
            ))
          }
          
          <div className="mt-3 p-2 bg-white rounded border">
            <small className="text-danger">
              <i className="bi bi-info-circle me-1"></i>
              <strong>No es posible proceder con la compra:</strong>
            </small>
            <ul className="mb-0 mt-1 small">
              {stockInfo
                .filter(info => !info.isValid)
                .map(info => (
                  <li key={`error-${info.productId}`} className="text-danger">
                    <strong>{info.name}</strong>: Stock insuficiente 
                    (Disponible: {info.available}, Solicitado: {info.requested})
                  </li>
                ))
              }
            </ul>
          </div>
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
