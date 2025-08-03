'use client';

import React, { useState, useEffect } from 'react';
import { Form, Card, Alert } from 'react-bootstrap';

interface LocationData {
  city: string;
  zone: string;
  address?: string;
}

interface DeliveryLocationSelectorProps {
  onLocationChange: (location: LocationData | null) => void;
  disabled?: boolean;
}

const CITIES_AND_ZONES = {
  'Santa Elena': [
    'Santa Elena',
    'La Libertad', 
    'Ballenita',
    'Salinas'
  ],
  'Guayaquil': [
    'Centro',
    'Urdesa',
    'Norte',
    'Sur',
    'Samborondón',
    'Ceibos',
    'Alborada',
    'Kennedy',
    'Las Peñas',
    'Mapasingue',
    'Sauces',
    'Via a la Costa'
  ]
};

export default function DeliveryLocationSelector({ onLocationChange, disabled }: DeliveryLocationSelectorProps) {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [showAddressField, setShowAddressField] = useState<boolean>(false);

  // Resetear zona cuando cambia la ciudad
  useEffect(() => {
    if (selectedCity && !CITIES_AND_ZONES[selectedCity as keyof typeof CITIES_AND_ZONES]?.includes(selectedZone)) {
      setSelectedZone('');
    }
  }, [selectedCity]);

  // Notificar cambios al componente padre
  useEffect(() => {
    if (selectedCity && selectedZone) {
      const locationData: LocationData = {
        city: selectedCity,
        zone: selectedZone,
        ...(address.trim() && { address: address.trim() })
      };
      onLocationChange(locationData);
      setShowAddressField(true);
    } else {
      onLocationChange(null);
      setShowAddressField(false);
    }
  }, [selectedCity, selectedZone, address, onLocationChange]);

  const availableZones = selectedCity ? CITIES_AND_ZONES[selectedCity as keyof typeof CITIES_AND_ZONES] || [] : [];

  return (
    <Card className="mb-3 border-0 shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h6 className="mb-0">
          <i className="bi bi-geo-alt-fill me-2"></i>
          Ubicación de Entrega
        </h6>
      </Card.Header>
      <Card.Body>
        <div className="row">
          {/* Selector de Ciudad */}
          <div className="col-md-6 mb-3">
            <Form.Group>
              <Form.Label className="fw-bold small">
                <i className="bi bi-building me-1"></i>
                Ciudad *
              </Form.Label>
              <Form.Select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={disabled}
                size="sm"
              >
                <option value="">Selecciona tu ciudad...</option>
                {Object.keys(CITIES_AND_ZONES).map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>

          {/* Selector de Zona */}
          <div className="col-md-6 mb-3">
            <Form.Group>
              <Form.Label className="fw-bold small">
                <i className="bi bi-map me-1"></i>
                Zona *
              </Form.Label>
              <Form.Select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                disabled={disabled || !selectedCity}
                size="sm"
              >
                <option value="">
                  {selectedCity ? 'Selecciona tu zona...' : 'Primero selecciona ciudad'}
                </option>
                {availableZones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>
        </div>

        {/* Campo de Dirección (aparece después de seleccionar ciudad y zona) */}
        {showAddressField && (
          <div className="row">
            <div className="col-12">
              <Form.Group>
                <Form.Label className="fw-bold small">
                  <i className="bi bi-house-door me-1"></i>
                  Dirección específica (opcional)
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej: Av. Principal 123, entre calles..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={disabled}
                  size="sm"
                />
                <Form.Text className="text-muted">
                  Ayuda al repartidor a encontrar tu ubicación más fácilmente
                </Form.Text>
              </Form.Group>
            </div>
          </div>
        )}

        {/* Información sobre la ubicación seleccionada */}
        {selectedCity && selectedZone && (
          <Alert variant="info" className="mt-3 mb-0">
            <div className="d-flex align-items-center">
              <i className="bi bi-check-circle-fill me-2"></i>
              <div>
                <strong>Entrega programada para:</strong><br />
                <span className="text-primary">
                  {selectedZone}, {selectedCity}
                  {address && (
                    <>
                      <br />
                      <small>{address}</small>
                    </>
                  )}
                </span>
              </div>
            </div>
          </Alert>
        )}

        {/* Información de ayuda */}
        {!selectedCity && (
          <Alert variant="light" className="mt-3 mb-0">
            <small>
              <i className="bi bi-info-circle me-1"></i>
              Selecciona tu ubicación para calcular el costo de entrega y asignar el repartidor más cercano.
            </small>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
}
