'use client';

import React, { useState, useEffect } from 'react';
import { Alert, Badge, Card, ListGroup, Button } from 'react-bootstrap';
import { inventoryService, type ProductInventory } from '../services/inventoryService';
import Link from 'next/link';

interface StockAlertProps {
  className?: string;
}

export default function StockAlert({ className = '' }: StockAlertProps) {
  const [lowStockProducts, setLowStockProducts] = useState<ProductInventory[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<ProductInventory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventoryAlerts();
  }, []);

  const loadInventoryAlerts = async () => {
    try {
      setLoading(true);
      const allProducts = await inventoryService.getAllProducts();
      
      const lowStock = allProducts.filter(product => product.stock > 0 && product.stock <= 5);
      const outOfStock = allProducts.filter(product => product.stock === 0);
      
      setLowStockProducts(lowStock);
      setOutOfStockProducts(outOfStock);
    } catch (error) {
      console.error('Error cargando alertas de inventario:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={`border-warning ${className}`}>
        <Card.Body className="text-center">
          <div className="spinner-border spinner-border-sm text-warning" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <small className="ms-2 text-muted">Verificando inventario...</small>
        </Card.Body>
      </Card>
    );
  }

  const totalAlerts = lowStockProducts.length + outOfStockProducts.length;

  if (totalAlerts === 0) {
    return (
      <Alert variant="success" className={`d-flex align-items-center ${className}`}>
        <i className="bi bi-check-circle-fill me-2"></i>
        <div>
          <strong>Inventario OK</strong>
          <div className="small">Todos los productos tienen stock adecuado</div>
        </div>
      </Alert>
    );
  }

  return (
    <div className={className}>
      {/* Alerta de productos sin stock */}
      {outOfStockProducts.length > 0 && (
        <Alert variant="danger" className="mb-3">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h6 className="alert-heading d-flex align-items-center mb-2">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Productos Sin Stock
                <Badge bg="danger" className="ms-2">{outOfStockProducts.length}</Badge>
              </h6>
              <p className="mb-2 small">Los siguientes productos no están disponibles para venta:</p>
              <ListGroup variant="flush" className="small">
                {outOfStockProducts.slice(0, 3).map(product => (
                  <ListGroup.Item key={product.productId} className="border-0 px-0 py-1 bg-transparent">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>
                        <strong>#{product.productId}</strong> - {product.name}
                      </span>
                      <Badge bg="danger">0 unidades</Badge>
                    </div>
                  </ListGroup.Item>
                ))}
                {outOfStockProducts.length > 3 && (
                  <ListGroup.Item className="border-0 px-0 py-1 bg-transparent small text-muted">
                    ... y {outOfStockProducts.length - 3} productos más
                  </ListGroup.Item>
                )}
              </ListGroup>
            </div>
            <Link href="/admin/inventory">
              <Button variant="outline-danger" size="sm">
                <i className="bi bi-arrow-right"></i>
              </Button>
            </Link>
          </div>
        </Alert>
      )}

      {/* Alerta de productos con stock bajo */}
      {lowStockProducts.length > 0 && (
        <Alert variant="warning" className="mb-0">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h6 className="alert-heading d-flex align-items-center mb-2">
                <i className="bi bi-exclamation-circle-fill me-2"></i>
                Stock Bajo
                <Badge bg="warning" text="dark" className="ms-2">{lowStockProducts.length}</Badge>
              </h6>
              <p className="mb-2 small">Los siguientes productos tienen poco stock disponible:</p>
              <ListGroup variant="flush" className="small">
                {lowStockProducts.slice(0, 3).map(product => (
                  <ListGroup.Item key={product.productId} className="border-0 px-0 py-1 bg-transparent">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>
                        <strong>#{product.productId}</strong> - {product.name}
                      </span>
                      <Badge bg="warning" text="dark">{product.stock} unidades</Badge>
                    </div>
                  </ListGroup.Item>
                ))}
                {lowStockProducts.length > 3 && (
                  <ListGroup.Item className="border-0 px-0 py-1 bg-transparent small text-muted">
                    ... y {lowStockProducts.length - 3} productos más
                  </ListGroup.Item>
                )}
              </ListGroup>
            </div>
            <Link href="/admin/inventory">
              <Button variant="outline-warning" size="sm">
                <i className="bi bi-arrow-right"></i>
              </Button>
            </Link>
          </div>
        </Alert>
      )}
    </div>
  );
}
