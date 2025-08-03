'use client';

import React, { useState, useEffect } from 'react';
import { Badge, Spinner } from 'react-bootstrap';
import { inventoryService } from '../services/inventoryService';

interface ProductStockIndicatorProps {
  productId: number;
  className?: string;
  showLabel?: boolean;
}

export default function ProductStockIndicator({ productId, className = '', showLabel = true }: ProductStockIndicatorProps) {
  const [stock, setStock] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkStock = async () => {
      try {
        setLoading(true);
        const stockAmount = await inventoryService.getProductStock(productId);
        const isAvailable = await inventoryService.isProductAvailable(productId, 1);
        
        setStock(stockAmount);
        setIsActive(isAvailable || stockAmount > 0);
      } catch (error) {
        console.error('Error verificando stock:', error);
        setStock(0);
        setIsActive(false);
      } finally {
        setLoading(false);
      }
    };

    // Solo verificar stock una vez cuando se monta el componente
    checkStock();
  }, [productId]); // Solo re-ejecutar si cambia el productId

  if (loading) {
    return (
      <div className={`d-flex align-items-center ${className}`}>
        <Spinner animation="border" size="sm" className="me-2" />
        <small>Verificando stock...</small>
      </div>
    );
  }

  const getStockStatus = () => {
    if (!isActive || stock === 0) {
      return {
        variant: 'danger',
        text: 'Sin stock',
        icon: 'x-circle-fill'
      };
    }
    
    if (stock <= 5) {
      return {
        variant: 'warning',
        text: `Últimas ${stock} unidades`,
        icon: 'exclamation-triangle-fill'
      };
    }
    
    if (stock <= 10) {
      return {
        variant: 'info',
        text: `${stock} disponibles`,
        icon: 'info-circle-fill'
      };
    }
    
    return {
      variant: 'success',
      text: 'Disponible',
      icon: 'check-circle-fill'
    };
  };

  const status = getStockStatus();

  return (
    <div className={`d-flex align-items-center ${className}`}>
      <Badge 
        bg={status.variant} 
        className="d-flex align-items-center"
        text={status.variant === 'warning' ? 'dark' : 'white'}
      >
        <i className={`bi bi-${status.icon} me-1`}></i>
        {showLabel ? status.text : stock}
      </Badge>
      {!showLabel && stock > 0 && (
        <small className="text-muted ms-2">en stock</small>
      )}
    </div>
  );
}
